import { Injectable } from '@nestjs/common';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { PrismaService } from 'nestjs-prisma';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    applicationId: number,
    createNotificationDto: CreateNotificationDto,
  ) {
    const compiledTemplates = await this.prisma.compiledTemplate.findMany({
      where: {
        templateId: createNotificationDto.templateId,
      },
    });

    const compiledMessages = compiledTemplates.map((compiledTemplate) => {
      // TODO: implement template compiler module
      return {
        templateId: compiledTemplate.templateId,
        messageType: compiledTemplate.messageType,
        compiledMessage:
          compiledTemplate.compiledTemplate +
          'with TemplateData' +
          JSON.stringify(createNotificationDto.templateData),
      };
    });

    const userPreferences = await this.prisma.userPreference.findMany({
      where: {
        notificationCategoryId: createNotificationDto.notificationCategoryId,
      },
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

    return this.prisma.notification.create({
      data: {
        applicationId,
        ...createNotificationDto,
        compiledMessages: {
          create: compiledMessages.map((compiledMessage) => {
            return {
              templateId: compiledMessage.templateId,
              messageType: compiledMessage.messageType,
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
    });
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
