import { Inject, Injectable } from '@nestjs/common';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { PrismaService } from 'nestjs-prisma';
import { ClientProxy, RmqRecordBuilder } from '@nestjs/microservices';
import { $Enums } from '@prisma/client';

const priorityMap = {
  [$Enums.Priority.LOW]: 1,
  [$Enums.Priority.MEDIUM]: 2,
  [$Enums.Priority.HIGH]: 3,
};
@Injectable()
export class NotificationsService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject('ChannelSenderService') private channelSenderClient: ClientProxy,
  ) {}

  async create(
    applicationId: number,
    createNotificationDto: CreateNotificationDto,
  ) {
    const userPreferences = (
      await this.prisma.notificationCategory.findUniqueOrThrow({
        where: {
          id: createNotificationDto.notificationCategoryId,
        },
        include: {
          userPreferences: {
            where: {
              isPreferred: true,
              userId: {
                in: createNotificationDto.recipientIds,
              },
            },
          },
        },
      })
    ).userPreferences;

    if (userPreferences.length === 0) {
      return null;
    }

    const compiledTemplates = (
      await this.prisma.template.findUniqueOrThrow({
        where: {
          id: createNotificationDto.templateId,
        },
        include: {
          compiledTemplates: true,
        },
      })
    ).compiledTemplates;

    const compiledMessages = compiledTemplates.map((compiledTemplate) => {
      // TODO: Katid implement template compiler module
      return {
        templateId: compiledTemplate.templateId,
        messageType: compiledTemplate.messageType,
        compiledMessage:
          compiledTemplate.compiledTemplate +
          'with TemplateData' +
          JSON.stringify(createNotificationDto.templateData),
      };
    });

    const channels = await this.prisma.channel.findMany({
      where: {
        accounts: {
          some: {
            userId: {
              in: userPreferences.map(
                (userPreference) => userPreference.userId,
              ),
            },
          },
        },
      },
      include: {
        accounts: {
          where: {
            userId: {
              in: userPreferences.map(
                (userPreference) => userPreference.userId,
              ),
            },
          },
        },
      },
    });

    const notifications = await this.prisma.notification.create({
      data: {
        applicationId,
        notificationCategoryId: createNotificationDto.notificationCategoryId,
        priority: createNotificationDto.priority,
        templateId: createNotificationDto.templateId,
        templateData: createNotificationDto.templateData,
        compiledMessages: {
          create: compiledMessages.map((compiledMessage) => {
            return {
              compiledMessage: compiledMessage.compiledMessage,
              compiledTemplate: {
                connect: {
                  templateId_messageType: {
                    templateId: compiledMessage.templateId,
                    messageType: compiledMessage.messageType,
                  },
                },
              },
              notificationTasks: {
                // TODO: Implement notification task service
                createMany: {
                  data: channels
                    .filter(
                      (channel) =>
                        channel.messageType === compiledMessage.messageType,
                    )
                    .flatMap((channel) =>
                      channel.accounts.map((account) => ({
                        userId: account.userId,
                        channelType: account.channelType,
                        priority: createNotificationDto.priority,
                        retryLimit: 3, // TODO: Move to config
                        retryCount: 0,
                      })),
                    ),
                },
              },
            };
          }),
        },
      },
      include: {
        notificationTasks: true,
      },
    });

    for (const notificationTask of notifications.notificationTasks) {
      const record = new RmqRecordBuilder(JSON.stringify(notificationTask))
        .setOptions({
          priority: priorityMap[notificationTask.priority],
        })
        .build();

      this.channelSenderClient.emit(notificationTask.channelType, record);
    }

    return notifications;
  }

  findAll() {
    return this.prisma.notification.findMany();
  }

  findAllByApplicationId(applicationId: number) {
    return this.prisma.notification.findMany({
      where: {
        applicationId,
      },
    });
  }

  findAllByTemplateId(templateId: number) {
    return this.prisma.notification.findMany({
      where: {
        templateId,
      },
    });
  }

  findAllByNotificationCategoryId(notificationCategoryId: number) {
    return this.prisma.notification.findMany({
      where: {
        notificationCategoryId,
      },
    });
  }

  findOne(id: number) {
    return this.prisma.notification.findUniqueOrThrow({
      where: {
        id,
      },
    });
  }
}
