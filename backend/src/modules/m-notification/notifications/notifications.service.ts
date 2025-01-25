import { Config } from '@/utils/config/config-dto';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy, RmqRecordBuilder } from '@nestjs/microservices';
import { $Enums, Prisma } from '@prisma/client';
import { PrismaService } from 'nestjs-prisma';
import { inspect } from 'util';
import { paginate } from '../../../utils/paginator/pagination.function';
import { PaginationQueryDto } from '../../../utils/paginator/paginationQuery.dto';
import { TemplatesService } from '../templates/templates.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { NotificationTasksOrderDto } from './dto/notification-tasks-order.dto';
import { OutputNotificationWithCompiledMessageAndNotificationTaskDto } from './dto/output-notification-with-compiled-message-and-notification-task.dto';
import { NotificationTask } from './entities/notification-task.entity';

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

    @Inject(`NotificationQueueClient${$Enums.ChannelType.SLACK}`)
    private notificationQueueClientSLACK: ClientProxy,

    private readonly templatesService: TemplatesService,
  ) {}

  private readonly logger = new Logger(NotificationsService.name);

  async create(
    applicationId: string,
    createNotificationDto: CreateNotificationDto,
  ) {
    this.logger.log('Creating notification: ' + inspect(createNotificationDto));
    this.logger.log('applicationId ' + applicationId);

    this.logger.log('get userPreferences');

    const isOTPNotification = Object.values($Enums.ChannelType)
      .map((channelType) => `System_${channelType}_OTP`)
      .includes(createNotificationDto.notificationCategoryId);

    this.logger.log('Is it OTP? ' + isOTPNotification);
    const userPreferences = isOTPNotification
      ? createNotificationDto.recipientIds.map((userId) => ({
          userId,
        }))
      : (
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

    this.logger.log('userPreferences ' + inspect(userPreferences));

    this.logger.log('get channels');
    const channels = await this.prisma.channel.findMany({
      include: {
        accounts: {
          where: {
            OR: [
              // allow sending notification to unverified accounts for OTP
              Object.values($Enums.ChannelType)
                .map((channelType) => `System_${channelType}_OTP`)
                .includes(createNotificationDto.notificationCategoryId)
                ? {
                    verifiedAt: null,
                  }
                : {
                    verifiedAt: {
                      not: null,
                    },
                  },
            ],
            userId: {
              in: userPreferences.map(
                (userPreference) => userPreference.userId,
              ),
            },
          },
        },
      },
    });

    const organizationDefaultEmailAccounts = await this.prisma.user.findMany({
      where: {
        id: {
          in: userPreferences.map((userPreference) => userPreference.userId),
        },
      },
    });

    // merge organization default email accounts with user accounts
    const mergedChannels = channels.map((channel) => {
      if (
        channel.channelType === $Enums.ChannelType.EMAIL &&
        !isOTPNotification
      ) {
        return {
          ...channel,
          accounts: [
            ...channel.accounts,
            ...organizationDefaultEmailAccounts.map(
              (organizationDefaultEmailAccount) => ({
                userId: organizationDefaultEmailAccount.id,
                channelType: channel.channelType,
                priority: createNotificationDto.priority,
              }),
            ),
          ].filter(
            (account, index, self) =>
              index ===
              self.findIndex(
                (t) =>
                  t.userId === account.userId &&
                  t.channelType === account.channelType,
              ),
          ),
        };
      }
      return channel;
    });

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
                  data: mergedChannels
                    .filter(
                      (channel) =>
                        channel.messageType === compiledMessage.messageType,
                    )
                    .flatMap((channel) => {
                      return channel.accounts.map((account) => ({
                        userId: account.userId,
                        channelType: account.channelType,
                        priority: createNotificationDto.priority,
                        retryLimit: Number(
                          this.config[`${account.channelType}_RETRY_LIMIT`],
                        ),
                        retryCount: 0,
                      }));
                    }),
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

    this.logger.log(
      'Emitting notification task events count: ' +
        notifications.notificationTasks.length,
    );
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

  findAllByApplicationId(applicationId: string) {
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

  findAllByNotificationCategoryId(notificationCategoryId: string) {
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

  getPaginatedNotificationsByUser(
    userId: string,
    paginateQuery: PaginationQueryDto,
  ) {
    // TODO Omit system OPT
    return paginate<
      OutputNotificationWithCompiledMessageAndNotificationTaskDto,
      Prisma.NotificationFindManyArgs
    >({
      prismaQueryModel: this.prisma.notification,
      findManyArgs: {
        where: {
          notificationTasks: {
            some: {
              userId,
            },
          },
        },
        include: {
          notificationTasks: {
            where: {
              userId,
            },
          },
          compiledMessages: {
            where: {
              messageType: {
                in: [$Enums.MessageType.HTML, $Enums.MessageType.TEXT],
              },
            },
          },
          application: {
            select: {
              name: true,
            },
          },
          notificationCategory: {
            select: {
              name: true,
            },
          },
        },
      },
      paginateOptions: paginateQuery,
    });
  }

  findOneByUser(userId: string, notificationId: number) {
    // TODO Omit system OPT
    return this.prisma.notification.findFirstOrThrow({
      where: {
        id: notificationId,
        notificationTasks: {
          some: {
            userId,
          },
        },
      },
      include: {
        notificationTasks: {
          where: {
            userId,
          },
        },
        compiledMessages: {
          where: {
            messageType: {
              in: [$Enums.MessageType.HTML, $Enums.MessageType.TEXT],
            },
          },
        },
        application: {
          select: {
            name: true,
          },
        },
        notificationCategory: {
          select: {
            name: true,
          },
        },
      },
    });
  }

  findAllNotificationTasksByApplicationIdPaginated(
    applicationId: string,
    paginateQuery: PaginationQueryDto,
    notificationTasksOrderDto: NotificationTasksOrderDto,
  ) {
    return paginate<NotificationTask, Prisma.NotificationTaskFindManyArgs>({
      prismaQueryModel: this.prisma.notificationTask,
      findManyArgs: {
        where: {
          notification: {
            applicationId,
          },
        },
        orderBy: {
          ...(notificationTasksOrderDto.sortField &&
          notificationTasksOrderDto.sortOrder
            ? {
                [notificationTasksOrderDto.sortField]:
                  notificationTasksOrderDto.sortOrder,
              }
            : {}),
        },
      },
      paginateOptions: paginateQuery,
    });
  }
}
