import { Config } from '@/utils/config/config-dto';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy, RmqRecordBuilder } from '@nestjs/microservices';
import { $Enums } from '@prisma/client';
import { PrismaService } from 'nestjs-prisma';
import * as nodemailer from 'nodemailer';
import { inspect } from 'util';
import { NotificationTaskMessageDto } from './dto/notification-task-message.dto';

const priorityMap = {
  [$Enums.Priority.LOW]: 1,
  [$Enums.Priority.MEDIUM]: 2,
  [$Enums.Priority.HIGH]: 3,
};

@Injectable()
export class MNotificationSendersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: Config,
    @Inject('NotificationQueueClient')
    private notificationQueueClient: ClientProxy,
  ) {}

  private readonly logger = new Logger(MNotificationSendersService.name);

  async processTask(
    notificationTask: NotificationTaskMessageDto,
    sendNotification: (messageData: MessageData) => Promise<void>,
  ) {
    const recipientAddress = (
      await this.prisma.account.findUniqueOrThrow({
        where: {
          userId_channelType: {
            userId: notificationTask.userId,
            channelType: notificationTask.channelType,
          },
        },
      })
    ).channelToken;

    const compiledMessage = (
      await this.prisma.compiledMessage.findUniqueOrThrow({
        where: {
          notificationId_templateId_messageType: {
            notificationId: notificationTask.notificationId,
            templateId: notificationTask.templateId,
            messageType: notificationTask.messageType,
          },
        },
      })
    ).compiledMessage;

    const title = (
      await this.prisma.compiledMessage.findUniqueOrThrow({
        where: {
          notificationId_templateId_messageType: {
            notificationId: notificationTask.notificationId,
            templateId: notificationTask.templateId,
            messageType: 'TEXT',
          },
        },
      })
    ).compiledMessage.split('\\n')[0];

    try {
      await sendNotification({ recipientAddress, compiledMessage, title });
      await this.prisma.notificationTask.update({
        where: {
          channelType_userId_notificationId_templateId_messageType: {
            channelType: notificationTask.channelType,
            userId: notificationTask.userId,
            notificationId: notificationTask.notificationId,
            templateId: notificationTask.templateId,
            messageType: notificationTask.messageType,
          },
        },
        data: {
          sentStatus: 'SENT',
          sentTimestamp: new Date(),
        },
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.error('Failed to send notification: ' + error.message);

        if (notificationTask.retryCount >= notificationTask.retryLimit) {
          this.logger.error(
            'Retry limit exhausted for task: ' + inspect(notificationTask),
          );
          await this.prisma.notificationTask.update({
            where: {
              channelType_userId_notificationId_templateId_messageType: {
                channelType: notificationTask.channelType,
                userId: notificationTask.userId,
                notificationId: notificationTask.notificationId,
                templateId: notificationTask.templateId,
                messageType: notificationTask.messageType,
              },
            },
            data: {
              retryCount: notificationTask.retryCount + 1,
              retryLimit: notificationTask.retryLimit,
              sentStatus: 'FAILED',
              failedTimestamp: new Date(),
            },
          });
          return;
        }

        const newNotificationTask = await this.prisma.notificationTask.update({
          where: {
            channelType_userId_notificationId_templateId_messageType: {
              channelType: notificationTask.channelType,
              userId: notificationTask.userId,
              notificationId: notificationTask.notificationId,
              templateId: notificationTask.templateId,
              messageType: notificationTask.messageType,
            },
          },
          data: {
            retryCount: notificationTask.retryCount + 1,
            retryLimit: notificationTask.retryLimit,
          },
        });

        const record = new RmqRecordBuilder(JSON.stringify(newNotificationTask))
          .setOptions({
            priority: priorityMap[notificationTask.priority],
          })
          .build();

        this.notificationQueueClient.emit(notificationTask.channelType, record);
      }
    }
  }

  emailTransporter = nodemailer.createTransport({
    host: this.config.EMAIL_HOST,
    port: this.config.EMAIL_PORT,
    ...(this.config.EMAIL_AUTH_USER && this.config.EMAIL_AUTH_PASS
      ? {
          auth: {
            user: this.config.EMAIL_AUTH_USER,
            pass: this.config.EMAIL_AUTH_PASS,
          },
        }
      : {}),
  });

  async sendEmailNotification(
    notificationTask: NotificationTaskMessageDto,
  ): Promise<void> {
    this.logger.log('processing email task: ');
    await this.processTask(
      {
        ...notificationTask,
        retryLimit:
          notificationTask.retryLimit === 0
            ? this.config.EMAIL_RETRY_LIMIT
            : notificationTask.retryLimit,
      },
      async ({ recipientAddress, compiledMessage, title }) => {
        this.logger.log('sending email to: ' + recipientAddress);
        this.logger.log('message: ' + compiledMessage);
        await this.emailTransporter.sendMail({
          from: this.config.EMAIL_FROM,
          to: recipientAddress,
          subject: title,
          text: compiledMessage,
        });
        this.logger.log('email sent');
      },
    );
  }
}

type MessageData = {
  recipientAddress: string;
  title?: string;
  compiledMessage: string;
};
