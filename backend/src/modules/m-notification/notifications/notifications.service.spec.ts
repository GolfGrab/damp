/* eslint-disable @typescript-eslint/unbound-method */
import { Config } from '@/utils/config/config-dto';
import { PaginationQueryDto } from '@/utils/paginator/paginationQuery.dto';
import { ClientProxy } from '@nestjs/microservices';
import { Test, TestingModule } from '@nestjs/testing';
import { $Enums, Notification, Template } from '@prisma/client';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { PrismaService } from 'nestjs-prisma';
import { TemplatesService } from '../templates/templates.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { NotificationsService } from './notifications.service';

describe('NotificationsService', () => {
  let service: NotificationsService;
  let prismaService: DeepMockProxy<PrismaService>;
  let templatesService: DeepMockProxy<TemplatesService>;
  let config: DeepMockProxy<Config>;
  let notificationQueueClientEMAIL: DeepMockProxy<ClientProxy>;
  let notificationQueueClientSMS: DeepMockProxy<ClientProxy>;
  let notificationQueueClientSLACK: DeepMockProxy<ClientProxy>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        { provide: PrismaService, useValue: mockDeep<PrismaService>() },
        { provide: TemplatesService, useValue: mockDeep<TemplatesService>() },
        { provide: Config, useValue: mockDeep<Config>() },
        {
          provide: `NotificationQueueClient${$Enums.ChannelType.EMAIL}`,
          useValue: mockDeep<ClientProxy>(),
        },
        {
          provide: `NotificationQueueClient${$Enums.ChannelType.SMS}`,
          useValue: mockDeep<ClientProxy>(),
        },
        {
          provide: `NotificationQueueClient${$Enums.ChannelType.SLACK}`,
          useValue: mockDeep<ClientProxy>(),
        },
      ],
    }).compile();

    service = module.get(NotificationsService);
    prismaService = module.get(PrismaService);
    templatesService = module.get(TemplatesService);
    config = module.get(Config);
    notificationQueueClientEMAIL = module.get(
      `NotificationQueueClient${$Enums.ChannelType.EMAIL}`,
    );
    notificationQueueClientSMS = module.get(
      `NotificationQueueClient${$Enums.ChannelType.SMS}`,
    );
    notificationQueueClientSLACK = module.get(
      `NotificationQueueClient${$Enums.ChannelType.SLACK}`,
    );
  });

  describe('create', () => {
    it('should create a notification and emit tasks', async () => {
      const date = new Date();
      const applicationId = 'app123';
      const createNotificationDto: CreateNotificationDto = {
        notificationCategoryId: 'notifCat123',
        recipientIds: ['user123'],
        priority: $Enums.Priority.HIGH,
        templateId: 'template123',
        templateData: { key: 'value' },
      };

      prismaService.account.findMany.mockResolvedValueOnce([
        {
          channelToken: 'abc',
          userId: 'user123',
          channelType: $Enums.ChannelType.EMAIL,
          createdAt: date,
          updatedAt: date,
          verifiedAt: date,
        },
      ]);

      prismaService.user.findMany.mockResolvedValueOnce([
        {
          id: 'user123',
          email: 'user@example.com',
          createdAt: date,
          updatedAt: date,
          createdByUserId: null,
          updatedByUserId: null,
        },
      ]);
      prismaService.template.findUniqueOrThrow.mockResolvedValueOnce({
        id: 'template123',
        name: 'Template',
        template: 'Hello {{key}}',
        createdAt: date,
        updatedAt: date,
        deletedAt: null,
        createdByUserId: 'user123',
        updatedByUserId: 'user123',
        deletedByUserId: null,
        compiledTemplates: [{ templateId: 'template123', messageType: 'text' }],
      } as Template);

      templatesService.render.mockResolvedValueOnce('Rendered message');
      prismaService.notification.create.mockResolvedValueOnce({
        id: 1,
        applicationId: 'app123',
        notificationCategoryId: 'notifCat123',
        templateId: 'template123',
        templateData: 'Rendered message',
        priority: $Enums.Priority.HIGH,
        createdAt: date,
        updatedAt: date,
      });
      prismaService.channel.findMany.mockResolvedValueOnce([
        {
          channelType: $Enums.ChannelType.EMAIL,
          messageType: $Enums.MessageType.TEXT,
        },
      ]);
      prismaService.notificationTask.createManyAndReturn.mockResolvedValueOnce([
        {
          notificationId: 1,
          userId: 'user123',
          channelType: $Enums.ChannelType.EMAIL,
          channelToken: 'user@example.com',
          priority: $Enums.Priority.HIGH,
          createdAt: date,
          updatedAt: date,
          failedTimestamp: null,
          id: 1,
          messageType: $Enums.MessageType.TEXT,
          retryCount: 0,
          retryLimit: 3,
          sentStatus: $Enums.SentStatus.PENDING,
          sentTimestamp: null,
          templateId: 'template123',
        },
      ]);

      await expect(
        service.create(applicationId, createNotificationDto),
      ).resolves.toEqual([
        {
          notificationId: 1,
          userId: 'user123',
          channelType: $Enums.ChannelType.EMAIL,
          channelToken: 'user@example.com',
          priority: $Enums.Priority.HIGH,
          createdAt: date,
          updatedAt: date,
          failedTimestamp: null,
          id: 1,
          messageType: $Enums.MessageType.TEXT,
          retryCount: 0,
          retryLimit: 3,
          sentStatus: $Enums.SentStatus.PENDING,
          sentTimestamp: null,
          templateId: 'template123',
        },
      ]);

      expect(prismaService.notification.create).toHaveBeenCalled();
      expect(notificationQueueClientEMAIL.emit).toHaveBeenCalled();
    });
  });

  describe('getPaginatedNotificationsByUser', () => {
    it('should return paginated notifications', async () => {
      const userId = 'user123';
      const paginateQuery: PaginationQueryDto = { page: 1, perPage: 10 };
      const date = new Date();

      prismaService.notification.findMany.mockResolvedValueOnce([
        {
          id: 1,
          notificationTasks: [],
          compiledMessages: [],
          application: { name: 'App' },
          notificationCategory: { name: 'Category' },
          applicationId: 'app123',
          notificationCategoryId: 'notifCat123',
          templateId: 'template123',
          templateData: 'Rendered message',
          createdAt: date,
          updatedAt: date,
          priority: $Enums.Priority.HIGH,
        } as Notification,
      ]);

      await expect(
        service.getPaginatedNotificationsByUser(userId, paginateQuery),
      ).resolves.toEqual({
        data: [
          {
            application: { name: 'App' },
            applicationId: 'app123',
            compiledMessages: [],
            createdAt: date,
            id: 1,
            notificationCategory: { name: 'Category' },
            notificationCategoryId: 'notifCat123',
            notificationTasks: [],
            priority: 'HIGH',
            templateData: 'Rendered message',
            templateId: 'template123',
            updatedAt: date,
          },
        ],
        meta: {
          currentPage: 1,
          lastPage: NaN,
          next: null,
          perPage: 10,
          prev: null,
          total: undefined,
        },
      });

      expect(prismaService.notification.findMany).toHaveBeenCalled();
    });
  });
});
