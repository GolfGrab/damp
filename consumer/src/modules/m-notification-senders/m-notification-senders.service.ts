import { Injectable } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { NotificationTaskMessageDto } from './dto/notification-task-message.dto';

@Injectable()
export class MNotificationSendersService {
  constructor(private readonly prisma: PrismaService) {}

  async processTask(data: NotificationTaskMessageDto) {
    console.log('Processing task:', data);

    console.log('userId', data.userId);
    console.log('channelType', data.channelType);
    console.log('notificationId', data.notificationId);
    console.log('templateId', data.templateId);
    console.log('messageType', data.messageType);

    const recipientAddress = (
      await this.prisma.account.findUniqueOrThrow({
        where: {
          userId_channelType: {
            userId: data.userId,
            channelType: data.channelType,
          },
        },
      })
    ).channelToken;

    const compiledMessage = (
      await this.prisma.compiledMessage.findUniqueOrThrow({
        where: {
          notificationId_templateId_messageType: {
            notificationId: data.notificationId,
            templateId: data.templateId,
            messageType: data.messageType,
          },
        },
      })
    ).compiledMessage;

    return {
      recipientAddress,
      compiledMessage,
    };
  }

  async sendEmail(data: NotificationTaskMessageDto) {
    const { recipientAddress, compiledMessage } = await this.processTask(data);
    console.log('Sending email to:', recipientAddress);
    console.log('Message:', compiledMessage);
  }
}
