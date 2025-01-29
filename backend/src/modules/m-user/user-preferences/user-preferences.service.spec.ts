/* eslint-disable @typescript-eslint/unbound-method */
import { Config } from '@/utils/config/config-dto';
import { Test, TestingModule } from '@nestjs/testing';
import { ChannelType } from '@prisma/client';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { PrismaService } from 'nestjs-prisma';
import { UpsertUserPreferenceDto } from './dto/upsert-user-preference.dto';
import { UserPreferencesService } from './user-preferences.service';

describe('UserPreferencesService', () => {
  let service: UserPreferencesService;
  let prismaService: DeepMockProxy<PrismaService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserPreferencesService,
        { provide: PrismaService, useValue: mockDeep<PrismaService>() },
        {
          provide: Config,
          useValue: mockDeep<Config>({
            SYSTEM_USER_ID: 'systemUser',
          }),
        },
      ],
    }).compile();

    service = module.get(UserPreferencesService);
    prismaService = module.get(PrismaService);
  });

  describe('upsert', () => {
    it('should upsert user preference', async () => {
      const userId = 'user123';
      const notificationCategoryId = 'notifCat123';
      const channelType = ChannelType.EMAIL;
      const dto: UpsertUserPreferenceDto = { isPreferred: true };

      const mockResponse = {
        userId,
        notificationCategoryId,
        channelType,
        ...dto,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      prismaService.userPreference.upsert.mockResolvedValueOnce(mockResponse);

      await expect(
        service.upsert(userId, notificationCategoryId, channelType, dto),
      ).resolves.toEqual(mockResponse);

      expect(prismaService.userPreference.upsert).toHaveBeenCalledWith({
        where: {
          userId: { not: 'systemUser' },
          notificationCategory: { createdByUserId: { not: 'systemUser' } },
          userId_channelType_notificationCategoryId: {
            userId,
            channelType,
            notificationCategoryId,
          },
        },
        create: { userId, notificationCategoryId, channelType, ...dto },
        update: dto,
      });
    });
  });

  describe('findAllByUserId', () => {
    it('should return user preferences excluding system user', async () => {
      const userId = 'user123';
      const mockPreferences = [
        {
          userId,
          notificationCategoryId: 'notif1',
          channelType: ChannelType.EMAIL,
          isPreferred: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      prismaService.userPreference.findMany.mockResolvedValueOnce(
        mockPreferences,
      );

      await expect(service.findAllByUserId(userId)).resolves.toEqual(
        mockPreferences,
      );

      expect(prismaService.userPreference.findMany).toHaveBeenCalledWith({
        where: {
          AND: [{ userId }, { userId: { not: 'systemUser' } }],
          notificationCategory: { createdByUserId: { not: 'systemUser' } },
        },
      });
    });
  });

  describe('updateManyByUserIdAndChannelType', () => {
    it('should update multiple user preferences', async () => {
      const userId = 'user123';
      const channelType = ChannelType.EMAIL;
      const dto: UpsertUserPreferenceDto = { isPreferred: true };

      prismaService.userPreference.updateMany.mockResolvedValueOnce({
        count: 2,
      });

      await expect(
        service.updateManyByUserIdAndChannelType(userId, channelType, dto),
      ).resolves.toEqual({ count: 2 });

      expect(prismaService.userPreference.updateMany).toHaveBeenCalledWith({
        where: {
          userId,
          channelType,
          notificationCategory: { createdByUserId: { not: 'systemUser' } },
        },
        data: dto,
      });
    });
  });
});
