import { Inject, Injectable, Logger } from '@nestjs/common';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { PrismaService } from 'nestjs-prisma';
import { ClientProxy, RmqRecordBuilder } from '@nestjs/microservices';
import { $Enums } from '@prisma/client';
import { inspect } from 'util';

const priorityMap = {
  [$Enums.Priority.LOW]: 1,
  [$Enums.Priority.MEDIUM]: 2,
  [$Enums.Priority.HIGH]: 3,
};
@Injectable()
export class NotificationsService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject('NotificationQueueClient') private notificationQueueClient: ClientProxy,
  ) {}

  private readonly logger = new Logger(NotificationsService.name);

  async create(
    applicationId: number,
    createNotificationDto: CreateNotificationDto,
  ) {
    this.logger.log('Creating notification: ' + inspect(createNotificationDto));
    this.logger.log('applicationId ' + applicationId);

    this.logger.log('get userPreferences');
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
      this.logger.log('No user preferences to send notification');
      return null;
    }

    this.logger.log('get compiledTemplates');
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

    this.logger.log('compiledTemplates ' + inspect(compiledTemplates));
    this.logger.log('create compiledMessages');
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

    this.logger.log('get channels');
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

    this.logger.log('channels ' + inspect(channels));
    this.logger.log('create notification tasks');
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

    this.logger.log('notifications ' + inspect(notifications));

    this.logger.log('Emitting notification task events');
    for (const notificationTask of notifications.notificationTasks) {
      const record = new RmqRecordBuilder(JSON.stringify(notificationTask))
        .setOptions({
          priority: priorityMap[notificationTask.priority],
        })
        .build();

      this.notificationQueueClient.emit(notificationTask.channelType, record);
    }

    this.logger.log('Notification tasks emitted');

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
