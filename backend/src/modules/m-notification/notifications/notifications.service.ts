import { Config } from '@/utils/config/config-dto';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy, RmqRecordBuilder } from '@nestjs/microservices';
import { $Enums } from '@prisma/client';
import { PrismaService } from 'nestjs-prisma';
import { inspect } from 'util';
import { TemplatesService } from '../templates/templates.service';
import { CreateNotificationDto } from './dto/create-notification.dto';

const priorityMap = {
  [$Enums.Priority.LOW]: 1,
  [$Enums.Priority.MEDIUM]: 2,
  [$Enums.Priority.HIGH]: 3,
};

@Injectable()
export class NotificationsService {
  constructor(
    private readonly prisma: PrismaService,

    private readonly config: Config,

    @Inject(`NotificationQueueClient${$Enums.ChannelType.EMAIL}`)
    private notificationQueueClientEMAIL: ClientProxy,

    @Inject(`NotificationQueueClient${$Enums.ChannelType.SMS}`)
    private notificationQueueClientSMS: ClientProxy,

    @Inject(`NotificationQueueClient${$Enums.ChannelType.WEB_PUSH}`)
    private notificationQueueClientWEB_PUSH: ClientProxy,

    @Inject(`NotificationQueueClient${$Enums.ChannelType.SLACK}`)
    private notificationQueueClientSLACK: ClientProxy,

    private readonly templatesService: TemplatesService,
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
    const compiledMessages = await Promise.all(
      compiledTemplates.map(async (compiledTemplate) => {
        return {
          templateId: compiledTemplate.templateId,
          messageType: compiledTemplate.messageType,
          compiledMessage: await this.templatesService.render(
            compiledTemplate.templateId,
            compiledTemplate.messageType,
            { data: createNotificationDto.templateData },
          ),
        };
      }),
    );

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
        templateData: JSON.stringify(createNotificationDto.templateData),
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
                        retryLimit: Number(
                          this.config[`${account.channelType}_RETRY_LIMIT`],
                        ),
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

      // NOTE:This type error may occur if the client proxy for a channel type isn't injected.
      this[`notificationQueueClient${notificationTask.channelType}`].emit(
        notificationTask.channelType,
        record,
      );
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

  findAllByTemplateId(templateId: string) {
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
