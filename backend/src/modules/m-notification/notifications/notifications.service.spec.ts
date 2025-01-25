/* eslint-disable @typescript-eslint/unbound-method */
import { Config } from '@/utils/config/config-dto';
import { ClientProxy } from '@nestjs/microservices';
import { Test, TestingModule } from '@nestjs/testing';
import {
  $Enums,
  Channel,
  Notification,
  NotificationCategory,
  Template,
} from '@prisma/client';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { PrismaService } from 'nestjs-prisma';
import { TemplatesService } from '../templates/templates.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { NotificationsService } from './notifications.service';

describe('NotificationsService', () => {
  let service: NotificationsService;
  let prisma: DeepMockProxy<PrismaService>;
  let templatesService: DeepMockProxy<TemplatesService>;
  let notificationQueueClients: Record<
    $Enums.ChannelType,
    DeepMockProxy<ClientProxy>
  >;

  beforeEach(async () => {
    notificationQueueClients = {
      [$Enums.ChannelType.EMAIL]: mockDeep<ClientProxy>(),
      [$Enums.ChannelType.SMS]: mockDeep<ClientProxy>(),
      [$Enums.ChannelType.SLACK]: mockDeep<ClientProxy>(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        {
          provide: PrismaService,
          useValue: mockDeep<PrismaService>(),
        },
        {
          provide: Config,
          useValue: {
            EMAIL_RETRY_LIMIT: 3,
            SMS_RETRY_LIMIT: 5,
            SLACK_RETRY_LIMIT: 1,
          },
        },
        {
          provide: TemplatesService,
          useValue: mockDeep<TemplatesService>(),
        },
        ...Object.entries(notificationQueueClients).map(([key, mock]) => ({
          provide: `NotificationQueueClient${key}`,
          useValue: mock,
        })),
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
    prisma = module.get(PrismaService);
    templatesService = module.get(TemplatesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a notification and emit tasks', async () => {
      const applicationId = 'app1';
      const createNotificationDto: CreateNotificationDto = {
        notificationCategoryId: 'cat1',
        priority: $Enums.Priority.HIGH,
        recipientIds: ['user1', 'user2'],
        templateId: 'temp1',
        templateData: { key: 'value' },
      };

      prisma.notificationCategory.findUniqueOrThrow.mockResolvedValueOnce({
        id: 'cat1',
        name: 'Test Category',
        applicationId,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdByUserId: 'user1',
        updatedByUserId: 'user1',
        userPreferences: [
          { userId: 'user1', isPreferred: true },
          { userId: 'user2', isPreferred: true },
        ],
      } as NotificationCategory);

      prisma.template.findUniqueOrThrow.mockResolvedValueOnce({
        id: 'temp1',
        name: 'Test Template',
        description: 'Test Description',
        template: 'raw template',
        createdAt: new Date(),
        updatedAt: new Date(),
        createdByUserId: 'user1',
        updatedByUserId: 'user1',

        compiledTemplates: [
          {
            templateId: 'temp1',
            messageType: $Enums.ChannelType.EMAIL,
          },
        ],
      } as Template);

      templatesService.render.mockResolvedValueOnce('Rendered Message');

      prisma.channel.findMany.mockResolvedValueOnce([
        {
          messageType: $Enums.MessageType.TEXT,
          channelType: $Enums.ChannelType.EMAIL,
          accounts: [
            { userId: 'user1', channelType: $Enums.ChannelType.EMAIL },
          ],
        } as Channel,
      ]);

      prisma.notification.create.mockResolvedValueOnce({
        id: 123,
        applicationId,
        notificationCategoryId: 'cat1',
        createdAt: new Date(),
        updatedAt: new Date(),
        priority: $Enums.Priority.HIGH,
        templateData: '',
        templateId: 'temp1',
        notificationTasks: [
          {
            id: 'task1',
            userId: 'user1',
            channelType: $Enums.ChannelType.EMAIL,
            priority: $Enums.Priority.HIGH,
          },
        ],
      } as Notification);

      const result = await service.create(applicationId, createNotificationDto);

      expect(
        prisma.notificationCategory.findUniqueOrThrow,
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: createNotificationDto.notificationCategoryId },
        }),
      );

      expect(prisma.template.findUniqueOrThrow).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: createNotificationDto.templateId },
        }),
      );

      expect(templatesService.render).toHaveBeenCalledWith(
        'temp1',
        $Enums.ChannelType.EMAIL,
        { data: createNotificationDto.templateData },
      );

      expect(
        notificationQueueClients[$Enums.ChannelType.EMAIL].emit,
      ).toHaveBeenCalledWith($Enums.ChannelType.EMAIL, expect.anything());

      expect(result).toBeDefined();
    });

    it('should return null if no user preferences match', async () => {
      const applicationId = 'app1';
      const createNotificationDto: CreateNotificationDto = {
        notificationCategoryId: 'cat1',
        priority: $Enums.Priority.HIGH,
        recipientIds: ['user1', 'user2'],
        templateId: 'temp1',
        templateData: { key: 'value' },
      };

      prisma.notificationCategory.findUniqueOrThrow.mockResolvedValueOnce({
        id: 'cat1',
        name: 'Test Category',
        applicationId,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdByUserId: 'user1',
        updatedByUserId: 'user1',
        userPreferences: [],
      } as NotificationCategory);

      const result = await service.create(applicationId, createNotificationDto);

      expect(result).toBeNull();
      expect(prisma.notificationCategory.findUniqueOrThrow).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return all notifications', async () => {
      prisma.notification.findMany.mockResolvedValueOnce([
        {
          id: 1,
          applicationId: 'app1',
          notificationCategoryId: 'cat1',
          templateId: 'temp1',
          templateData: 'data',
          priority: $Enums.Priority.HIGH,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          applicationId: 'app1',
          notificationCategoryId: 'cat2',
          templateId: 'temp2',
          templateData: 'data',
          priority: $Enums.Priority.HIGH,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);

      const result = await service.findAll();
      expect(result).toEqual([
        {
          id: 1,
          applicationId: 'app1',
          notificationCategoryId: 'cat1',
          templateId: 'temp1',
          templateData: 'data',
          priority: $Enums.Priority.HIGH,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          applicationId: 'app1',
          notificationCategoryId: 'cat2',
          templateId: 'temp2',
          templateData: 'data',
          priority: $Enums.Priority.HIGH,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);
    });
  });

  describe('findAllByApplicationId', () => {
    it('should return all notifications for a specific application', async () => {
      const applicationId = 'app1';
      prisma.notification.findMany.mockResolvedValueOnce([
        {
          id: 1,
          applicationId: 'app1',
          notificationCategoryId: 'cat1',
          templateId: 'temp1',
          templateData: 'data',
          priority: $Enums.Priority.HIGH,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          applicationId: 'app1',
          notificationCategoryId: 'cat2',
          templateId: 'temp2',
          templateData: 'data',
          priority: $Enums.Priority.HIGH,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);
      const result = await service.findAllByApplicationId(applicationId);
      expect(result).toEqual([
        {
          id: 1,
          applicationId: 'app1',
          notificationCategoryId: 'cat1',
          templateId: 'temp1',
          templateData: 'data',
          priority: $Enums.Priority.HIGH,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          applicationId: 'app1',
          notificationCategoryId: 'cat2',
          templateId: 'temp2',
          templateData: 'data',
          priority: $Enums.Priority.HIGH,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);
    });
  });

  describe('findOne', () => {
    it('should return a notification by ID', async () => {
      const mockDate = new Date();

      const notificationId = 1;
      prisma.notification.findUniqueOrThrow.mockResolvedValueOnce({
        id: notificationId,
        applicationId: 'app1',
        notificationCategoryId: 'cat1',
        templateId: 'temp1',
        templateData: 'data',
        priority: $Enums.Priority.HIGH,
        createdAt: mockDate,
        updatedAt: mockDate,
      });

      const result = await service.findOne(notificationId);
      expect(result).toEqual({
        id: notificationId,
        applicationId: 'app1',
        notificationCategoryId: 'cat1',
        templateId: 'temp1',
        templateData: 'data',
        priority: $Enums.Priority.HIGH,
        createdAt: mockDate,
        updatedAt: mockDate,
      });
    });
  });
});
