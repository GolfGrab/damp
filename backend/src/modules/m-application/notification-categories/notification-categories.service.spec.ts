/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { NotificationCategory } from '@prisma/client';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { PrismaService } from 'nestjs-prisma';
import { CreateNotificationCategoryDto } from './dto/create-notification-category.dto';
import { NotificationCategoriesService } from './notification-categories.service';

describe('NotificationCategoriesService', () => {
  let service: NotificationCategoriesService;
  let prismaService: DeepMockProxy<PrismaService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationCategoriesService,
        { provide: PrismaService, useValue: mockDeep<PrismaService>() },
      ],
    }).compile();

    service = module.get(NotificationCategoriesService);
    prismaService = module.get(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a notification category', async () => {
      const applicationId = 'app1';
      const createDto: CreateNotificationCategoryDto = {
        id: 'cat1',
        name: 'Test Category',
        createdByUserId: 'user1',
        updatedByUserId: 'user1',
      };

      const mockCreatedCategory: NotificationCategory = {
        ...createDto,
        applicationId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaService.notificationCategory.create.mockResolvedValueOnce(
        mockCreatedCategory,
      );

      const result = await service.create(applicationId, createDto);
      expect(prismaService.notificationCategory.create).toHaveBeenCalledWith({
        data: {
          ...createDto,
          applicationId,
        },
      });
      expect(result).toEqual(mockCreatedCategory);
    });
  });

  describe('findAll', () => {
    it('should return all notification categories', async () => {
      const mockCategories: NotificationCategory[] = [
        {
          id: 'cat1',
          applicationId: 'app1',
          name: 'Category 1',
          createdAt: new Date(),
          createdByUserId: 'user1',
          updatedAt: new Date(),
          updatedByUserId: 'user1',
        },
        {
          id: 'cat2',
          applicationId: 'app1',
          name: 'Category 2',
          createdAt: new Date(),
          createdByUserId: 'user2',
          updatedAt: new Date(),
          updatedByUserId: 'user2',
        },
      ];

      prismaService.notificationCategory.findMany.mockResolvedValueOnce(
        mockCategories,
      );

      const result = await service.findAll();
      expect(prismaService.notificationCategory.findMany).toHaveBeenCalled();
      expect(result).toEqual(mockCategories);
    });
  });

  describe('findAllByApplicationId', () => {
    it('should return categories filtered by application ID', async () => {
      const applicationId = 'app1';
      const mockCategories: NotificationCategory[] = [
        {
          id: 'cat1',
          applicationId,
          name: 'Category 1',
          createdAt: new Date(),
          createdByUserId: 'user1',
          updatedAt: new Date(),
          updatedByUserId: 'user1',
        },
      ];

      prismaService.notificationCategory.findMany.mockResolvedValueOnce(
        mockCategories,
      );

      const result = await service.findAllByApplicationId(applicationId);
      expect(prismaService.notificationCategory.findMany).toHaveBeenCalledWith({
        where: { applicationId },
      });
      expect(result).toEqual(mockCategories);
    });
  });

  describe('findOne', () => {
    it('should return a category by ID', async () => {
      const id = 'cat1';
      const mockCategory: NotificationCategory = {
        id,
        applicationId: 'app1',
        name: 'Category 1',
        createdAt: new Date(),
        createdByUserId: 'user1',
        updatedAt: new Date(),
        updatedByUserId: 'user1',
      };

      prismaService.notificationCategory.findUniqueOrThrow.mockResolvedValueOnce(
        mockCategory,
      );

      const result = await service.findOne(id);
      expect(
        prismaService.notificationCategory.findUniqueOrThrow,
      ).toHaveBeenCalledWith({
        where: { id },
      });
      expect(result).toEqual(mockCategory);
    });
  });

  describe('update', () => {
    it('should update a category by ID', async () => {
      const id = 'cat1';
      const updateDto = { name: 'Updated Category' };
      const mockUpdatedCategory: NotificationCategory = {
        id,
        applicationId: 'app1',
        name: updateDto.name,
        createdAt: new Date(),
        createdByUserId: 'user1',
        updatedAt: new Date(),
        updatedByUserId: 'user1',
      };

      prismaService.notificationCategory.update.mockResolvedValueOnce(
        mockUpdatedCategory,
      );

      const result = await service.update(id, updateDto);
      expect(prismaService.notificationCategory.update).toHaveBeenCalledWith({
        where: { id },
        data: updateDto,
      });
      expect(result).toEqual(mockUpdatedCategory);
    });
  });
});
