/* eslint-disable @typescript-eslint/unbound-method */
import { UserWithRoles } from '@/auth/UserWithRoles';
import { Config } from '@/utils/config/config-dto';
import { ForbiddenException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { NotificationCategory } from '@prisma/client';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { PrismaService } from 'nestjs-prisma';
import { CreateNotificationCategoryDto } from './dto/create-notification-category.dto';
import { UpdateNotificationCategoryDto } from './dto/update-notification-category.dto';
import { NotificationCategoriesService } from './notification-categories.service';

describe('NotificationCategoriesService', () => {
  let service: NotificationCategoriesService;
  let prismaService: DeepMockProxy<PrismaService>;
  let user: UserWithRoles;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationCategoriesService,
        { provide: PrismaService, useValue: mockDeep<PrismaService>() },
        { provide: Config, useValue: mockDeep<Config>() },
      ],
    }).compile();

    service = module.get(NotificationCategoriesService);
    prismaService = module.get(PrismaService);
    user = {
      id: 'user1',
      roles: [],
      email: 'user1@email.com',
      createdAt: new Date(),
      updatedAt: new Date(),
      createdByUserId: null,
      updatedByUserId: null,
    };
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a notification category', async () => {
      const applicationId = 'app1';
      const createDto: CreateNotificationCategoryDto = {
        name: 'Test Category',
      };

      const mockCreatedCategory: NotificationCategory = {
        ...createDto,
        id: 'cat1',
        applicationId,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdByUserId: user.id,
        updatedByUserId: user.id,
        deletedAt: null,
        deletedByUserId: null,
      };

      prismaService.application.findFirst.mockResolvedValueOnce({
        id: applicationId,
        createdByUserId: user.id,
        apiKey: 'apiKey',
        name: 'name',
        description: 'description',
        createdAt: new Date(),
        updatedAt: new Date(),
        updatedByUserId: user.id,
      });

      prismaService.notificationCategory.create.mockResolvedValueOnce(
        mockCreatedCategory,
      );

      const result = await service.create(applicationId, createDto, user);

      const resultWithMockedId = { ...result, id: 'cat1' };
      expect(resultWithMockedId).toEqual(mockCreatedCategory);
    });

    it('should throw ForbiddenException if user is not allowed', async () => {
      prismaService.application.findFirst.mockResolvedValueOnce(null);

      const result = service.create('app1', { name: 'Test Category' }, user);
      await expect(result).rejects.toThrow(ForbiddenException);
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
          deletedAt: null,
          deletedByUserId: null,
        },
      ];

      prismaService.notificationCategory.findMany.mockResolvedValueOnce(
        mockCategories,
      );
      const result = await service.findAllByApplicationId(applicationId, user);
      expect(result).toEqual(mockCategories);
    });
  });

  describe('update', () => {
    it('should update a category', async () => {
      const id = 'cat1';
      const updateDto = {
        name: 'Updated Category',
      } satisfies UpdateNotificationCategoryDto;
      const mockUpdatedCategory: NotificationCategory = {
        id,
        applicationId: 'app1',
        name: updateDto.name,
        createdAt: new Date(),
        createdByUserId: 'user1',
        updatedAt: new Date(),
        updatedByUserId: 'user1',
        deletedAt: null,
        deletedByUserId: null,
      };

      prismaService.notificationCategory.update.mockResolvedValueOnce(
        mockUpdatedCategory,
      );
      const result = await service.update(id, updateDto, user);
      expect(result).toEqual(mockUpdatedCategory);
    });
  });
});
