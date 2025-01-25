import { Config } from '@/utils/config/config-dto';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy, RmqRecordBuilder } from '@nestjs/microservices';
import { $Enums } from '@prisma/client';
import { WebClient } from '@slack/web-api';
import { PrismaService } from 'nestjs-prisma';
import * as nodemailer from 'nodemailer';
import { Twilio } from 'twilio';
import { NotificationTaskMessageDto } from './dto/notification-task-message.dto';

const priorityMap = {
  [$Enums.Priority.LOW]: 1,
  [$Enums.Priority.MEDIUM]: 2,
  [$Enums.Priority.HIGH]: 3,
};

@Injectable()
export class MNotificationSendersService {
  private readonly logger = new Logger(MNotificationSendersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: Config,
    @Inject('NotificationQueueClient')
    private notificationQueueClient: ClientProxy,
  ) {}

  private readonly emailTransporter = nodemailer.createTransport({
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
    this.logger.log('Processing email task...');
    await this.processTask(notificationTask, this.sendEmail);
  }

  private sendEmail = async ({
    recipientAddress,
    compiledMessage,
    title,
  }: MessageData): Promise<void> => {
    this.logger.log(`Sending email to: ${recipientAddress}`);
    this.logger.log(`Message: ${compiledMessage}`);

    await this.emailTransporter.sendMail({
      from: this.config.EMAIL_FROM,
      to: recipientAddress,
      subject: title,
      html: compiledMessage,
    });

    this.logger.log('Email sent');
  };

  private readonly smsTwilioClientTransporter = new Twilio(
    this.config.SMS_TWILIO_ACCOUNT_SID,
    this.config.SMS_TWILIO_AUTH_TOKEN,
  );

  async sendSmsNotification(
    notificationTask: NotificationTaskMessageDto,
  ): Promise<void> {
    this.logger.log('Processing sms task...');
    await this.processTask(notificationTask, this.sendSms);
  }

  private sendSms = async ({
    recipientAddress,
    compiledMessage,
  }: MessageData): Promise<void> => {
    this.logger.log(`Sending sms to: ${recipientAddress}`);
    this.logger.log(`Message: ${compiledMessage}`);

    await this.smsTwilioClientTransporter.messages.create({
      body: compiledMessage,
      from: this.config.SMS_TWILIO_FROM_PHONE_NUMBER,
      to: recipientAddress,
    });

    this.logger.log('Sms sent');
  };

  private readonly slackBotClientTransporter = new WebClient(
    this.config.SLACK_BOT_TOKEN,
  );

  async sendSlackNotification(
    notificationTask: NotificationTaskMessageDto,
  ): Promise<void> {
    this.logger.log('Processing slack task...');
    await this.processTask(notificationTask, this.sendSlack);
  }

  private sendSlack = async ({
    recipientAddress,
    compiledMessage,
  }: MessageData): Promise<void> => {
    this.logger.log(`Sending slack to: ${recipientAddress}`);
    this.logger.log(`Message: ${compiledMessage}`);

    const receiver = await this.slackBotClientTransporter.conversations.open({
      users: recipientAddress,
    });
    if (!receiver.ok || !receiver.channel?.id) {
      throw new Error('Failed to open conversation');
    }
    const receiverChannelId = receiver.channel?.id;
    await this.slackBotClientTransporter.chat.postMessage({
      channel: receiverChannelId,
      text: compiledMessage,
    });
    this.logger.log('Slack sent');
  };

  private async processTask(
    notificationTask: NotificationTaskMessageDto,
    sendNotification: (messageData: MessageData) => Promise<void>,
  ) {
    try {
      const recipientAddress = await this.getRecipientAddress(notificationTask);
      const { compiledMessage, title } =
        await this.getMessageDetails(notificationTask);
      await sendNotification({ recipientAddress, compiledMessage, title });
      await this.updateTaskStatus(notificationTask, 'SENT');
    } catch (error) {
      await this.handleTaskError(notificationTask, error);
    }
  }

  private async getRecipientAddress(
    notificationTask: NotificationTaskMessageDto,
  ): Promise<string> {
    const account = await this.prisma.account.findUniqueOrThrow({
      where: {
        userId_channelType: {
          userId: notificationTask.userId,
          channelType: notificationTask.channelType,
        },
      },
    });
    return account.channelToken;
  }

  private async getMessageDetails(
    notificationTask: NotificationTaskMessageDto,
  ): Promise<{ compiledMessage: string; title: string | undefined }> {
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
    ).compiledMessage.split('\n')[0];

    return { compiledMessage, title };
  }

  private async updateTaskStatus(
    notificationTask: NotificationTaskMessageDto,
    status: 'SENT' | 'FAILED',
  ): Promise<void> {
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
        sentStatus: status,
        sentTimestamp: status === 'SENT' ? new Date() : undefined,
        failedTimestamp: status === 'FAILED' ? new Date() : undefined,
      },
    });
  }

  private async handleTaskError(
    notificationTask: NotificationTaskMessageDto,
    error: unknown,
  ): Promise<void> {
    if (error instanceof Error) {
      this.logger.error(`Failed to send notification: ${error.message}`);

      if (notificationTask.retryCount >= notificationTask.retryLimit) {
        this.logger.error(
          `Retry limit exhausted for task: ${JSON.stringify(notificationTask)}`,
        );
        await this.updateTaskStatus(notificationTask, 'FAILED');
        return;
      }

      await this.retryTask(notificationTask);
    }
  }

  private async retryTask(
    notificationTask: NotificationTaskMessageDto,
  ): Promise<void> {
    const updatedTask = await this.prisma.notificationTask.update({
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

    const record = new RmqRecordBuilder(JSON.stringify(updatedTask))
      .setOptions({
        priority: priorityMap[notificationTask.priority],
      })
      .build();

    this.notificationQueueClient.emit(notificationTask.channelType, record);
  }
}

type MessageData = {
  recipientAddress: string;
  title?: string;
  compiledMessage: string;
};
