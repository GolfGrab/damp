import { Role } from '@/auth/auth-roles.decorator';
import { UserWithRoles } from '@/auth/UserWithRoles';
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

    const isOTPNotification = Object.values($Enums.ChannelType)
      .map((channelType) => `System_${channelType}_OTP`)
      .includes(createNotificationDto.notificationCategoryId);

    const accounts = await this.prisma.account.findMany({
      where: {
        verifiedAt: isOTPNotification
          ? null
          : {
              not: null,
            },
        userId: {
          in: createNotificationDto.recipientIds,
        },
        user: isOTPNotification
          ? {}
          : {
              userPreferences: {
                some: {
                  notificationCategoryId:
                    createNotificationDto.notificationCategoryId,
                  isPreferred: true,
                },
              },
            },
      },
    });

    this.logger.log('preferred accounts ' + inspect(accounts));

    this.logger.log('get organizationDefaultEmailAccounts');

    const organizationDefaultEmailAccounts = isOTPNotification
      ? []
      : (
          await this.prisma.user.findMany({
            where: {
              id: {
                in: createNotificationDto.recipientIds,
              },
            },
          })
        ).map((user) => ({
          userId: user.id,
          channelType: $Enums.ChannelType.EMAIL,
          channelToken: user.email,
        }));

    const mergedAccounts = [
      ...accounts,
      ...organizationDefaultEmailAccounts,
    ].filter(
      (account, index, self) =>
        index ===
        self.findIndex(
          (t) =>
            t.userId === account.userId &&
            t.channelType === account.channelType &&
            t.channelToken === account.channelToken,
        ),
    );

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

    this.logger.log('create notification');

    const notification = await this.prisma.notification.create({
      data: {
        applicationId,
        notificationCategoryId: createNotificationDto.notificationCategoryId,
        priority: createNotificationDto.priority,
        templateId: createNotificationDto.templateId,
        templateData: JSON.stringify(createNotificationDto.templateData),
        compiledMessages: {
          createMany: {
            data: compiledMessages,
          },
        },
      },
    });

    this.logger.log('get all channel');

    const allChannel = await this.prisma.channel.findMany();

    this.logger.log('create notification task');

    const notificationTasks =
      await this.prisma.notificationTask.createManyAndReturn({
        data: mergedAccounts
          .map((account) => ({
            notificationId: notification.id,
            userId: account.userId,
            channelType: account.channelType,
            channelToken: account.channelToken,
            priority: createNotificationDto.priority,
            retryLimit: Number(
              this.config[`${account.channelType}_RETRY_LIMIT`],
            ),
            retryCount: 0,
            templateId: createNotificationDto.templateId,
            messageType:
              allChannel.find(
                (channel) => channel.channelType === account.channelType,
              )?.messageType ?? null,
          }))
          .filter(
            (notificationTask) => notificationTask.messageType !== null,
          ) as Prisma.NotificationTaskCreateManyInput[],
      });

    this.logger.log('notifications ' + inspect(notification));

    this.logger.log(
      'Emitting notification task events count: ' + notificationTasks.length,
    );

    for (const notificationTask of notificationTasks) {
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

    return notificationTasks;
  }

  findOne(id: number) {
    return this.prisma.notification.findUniqueOrThrow({
      where: {
        id,
        application: {
          id: {
            not: this.config.SYSTEM_APPLICATION_ID,
          },
        },
      },
    });
  }

  getPaginatedNotificationsByUser(
    userId: string,
    paginateQuery: PaginationQueryDto,
  ) {
    return paginate<
      OutputNotificationWithCompiledMessageAndNotificationTaskDto,
      Prisma.NotificationFindManyArgs
    >({
      prismaQueryModel: this.prisma.notification,
      findManyArgs: {
        where: {
          application: {
            id: {
              not: this.config.SYSTEM_APPLICATION_ID,
            },
          },
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
          compiledMessages: true,
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
        orderBy: {
          createdAt: 'desc',
        },
      },
      paginateOptions: paginateQuery,
    });
  }

  findOneByUser(userId: string, notificationId: number) {
    return this.prisma.notification.findFirstOrThrow({
      where: {
        application: {
          id: {
            not: this.config.SYSTEM_APPLICATION_ID,
          },
        },
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
        compiledMessages: true,
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
    user: UserWithRoles,
  ) {
    return paginate<NotificationTask, Prisma.NotificationTaskFindManyArgs>({
      prismaQueryModel: this.prisma.notificationTask,
      findManyArgs: {
        where: {
          notification: {
            AND: [
              {
                applicationId,
              },
              {
                application: {
                  id: {
                    not: this.config.SYSTEM_APPLICATION_ID,
                  },
                  createdByUserId: user.roles.includes(Role.Admin)
                    ? undefined
                    : user.id,
                },
              },
            ],
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
