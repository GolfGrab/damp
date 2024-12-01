import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy, RmqRecordBuilder } from '@nestjs/microservices';
import { $Enums } from '@prisma/client';
import { PrismaService } from 'nestjs-prisma';
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
    @Inject('NotificationQueueClient')
    private notificationQueueClient: ClientProxy,
  ) {}

  private readonly logger = new Logger(MNotificationSendersService.name);

  async processTask(
    notificationTask: NotificationTaskMessageDto,
    sendNotification: (messageData: MessageData) => Promise<void>,
  ) {
    this.logger.log('Processing task: ' + inspect(notificationTask));

    this.logger.log('userId ' + notificationTask.userId);
    this.logger.log('channelType ' + notificationTask.channelType);
    this.logger.log('notificationId ' + notificationTask.notificationId);
    this.logger.log('templateId ' + notificationTask.templateId);
    this.logger.log('messageType ' + notificationTask.messageType);

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

    try {
      await sendNotification({ recipientAddress, compiledMessage });
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

  async sendEmailNotification(
    notificationTask: NotificationTaskMessageDto,
  ): Promise<void> {
    this.logger.log('processing email task: ' + inspect(notificationTask));
    await this.processTask(
      notificationTask,
      ({ recipientAddress, compiledMessage }) => {
        this.logger.log('sending email to: ' + recipientAddress);
        this.logger.log('message: ' + compiledMessage);
        if (Math.random() < 0.8) {
          // TODO: Replace with actual email sending logic
          return Promise.resolve();
        } else {
          return Promise.reject(new Error('Failed to send email'));
        }
      },
    );
  }
}

type MessageData = {
  recipientAddress: string;
  compiledMessage: string;
};
