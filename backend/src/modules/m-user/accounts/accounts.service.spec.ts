/* eslint-disable @typescript-eslint/unbound-method */
import { NotificationsService } from '@/modules/m-notification/notifications/notifications.service';
import { Config } from '@/utils/config/config-dto';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as prisma from '@prisma/client';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { PrismaService } from 'nestjs-prisma';
import { AccountsService } from './accounts.service';
import { UpsertAccountDto } from './dto/upsert-account.dto';

describe('AccountsService', () => {
  let service: AccountsService;
  let prismaService: DeepMockProxy<PrismaService>;
  let notificationService: DeepMockProxy<NotificationsService>;
  let config: DeepMockProxy<Config>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccountsService,
        { provide: PrismaService, useValue: mockDeep<PrismaService>() },
        {
          provide: NotificationsService,
          useValue: mockDeep<NotificationsService>(),
        },
        {
          provide: Config,
          useValue: mockDeep<Config>({
            SYSTEM_USER_ID: 'systemUser',
          }),
        },
      ],
    }).compile();

    service = module.get<AccountsService>(AccountsService);
    prismaService = module.get(PrismaService);
    notificationService = module.get(NotificationsService);
    config = module.get(Config);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('upsert', () => {
    it('should upsert an account and send OTP', async () => {
      const userId = 'user123';
      const channelType = prisma.$Enums.ChannelType.EMAIL;
      const upsertAccountDto: UpsertAccountDto = {
        channelToken: 'channelToken123',
      };

      const mockOtpCode = '123456';
      const mockAccount = {
        userId,
        channelType,
        channelToken: 'channelToken123',
        otp: { otpCode: mockOtpCode },
        verifiedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(service, 'generateOtp').mockReturnValue(mockOtpCode);
      prismaService.account.upsert.mockResolvedValueOnce(mockAccount);

      const result = await service.upsert(
        userId,
        channelType,
        upsertAccountDto,
      );

      expect(result).toEqual(mockAccount);
      expect(prismaService.account.upsert).toHaveBeenCalledTimes(1);
      expect(notificationService.create).toHaveBeenCalledWith(
        'System-application',
        expect.objectContaining({
          recipientIds: [userId],
          notificationCategoryId: `System_${channelType}_OTP`,
          templateData: { otpCode: mockOtpCode },
        }),
      );
    });
  });

  describe('createNewOtp', () => {
    it('should create a new OTP for an account', async () => {
      const userId = 'user123';
      const channelType = prisma.$Enums.ChannelType.EMAIL;
      const account = {
        userId,
        channelType,
        verifiedAt: null,
        updatedAt: new Date(),
        createdAt: new Date(),
        channelToken: 'channelToken123',
      };
      const mockOtpCode = '654321';

      jest.spyOn(service, 'generateOtp').mockReturnValue(mockOtpCode);
      prismaService.account.findUnique.mockResolvedValueOnce(account);
      prismaService.account.update.mockResolvedValueOnce(account);

      const result = await service.createNewOtp(userId, channelType);

      expect(result).toEqual(account);
      expect(prismaService.account.update).toHaveBeenCalledTimes(1);
      expect(notificationService.create).toHaveBeenCalledWith(
        'System-application',
        expect.objectContaining({
          recipientIds: [userId],
          notificationCategoryId: `System_${channelType}_OTP`,
          templateData: { otpCode: mockOtpCode },
        }),
      );
    });

    it('should throw NotFoundException if account is not found', async () => {
      const userId = 'user123';
      const channelType = prisma.$Enums.ChannelType.EMAIL;

      prismaService.account.findUnique.mockResolvedValueOnce(null);

      await expect(service.createNewOtp(userId, channelType)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException if account is already verified', async () => {
      const userId = 'user123';
      const channelType = prisma.$Enums.ChannelType.EMAIL;
      const account = {
        userId,
        channelType,
        verifiedAt: new Date(),
        updatedAt: new Date(),
        createdAt: new Date(),
        channelToken: 'channelToken123',
      };

      prismaService.account.findUnique.mockResolvedValueOnce(account);

      await expect(service.createNewOtp(userId, channelType)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('verify', () => {
    it('should verify an OTP and update the account', async () => {
      const userId = 'user123';
      const channelType = prisma.$Enums.ChannelType.EMAIL;
      const verifyUserDto = { otpCode: '123456' };
      const mostRecentOtp = {
        id: 1,
        otpCode: '123456',
        verifiedAt: null,
        expiredAt: new Date(),
        userId,
        channelType,
        createdAt: new Date(),
      };

      const mockAccount = {
        userId,
        channelType,
        verifiedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        channelToken: 'channel',
      };

      prismaService.otp.findFirst.mockResolvedValueOnce(mostRecentOtp);
      prismaService.account.update.mockResolvedValueOnce(mockAccount);

      const result = await service.verify(userId, channelType, verifyUserDto);

      expect(result).toEqual(mockAccount);
      expect(prismaService.account.update).toHaveBeenCalledTimes(1);
    });

    it('should throw NotFoundException if OTP is not found', async () => {
      const userId = 'user123';
      const channelType = prisma.$Enums.ChannelType.EMAIL;
      const verifyUserDto = { otpCode: '123456' };

      prismaService.otp.findFirst.mockResolvedValueOnce(null);

      await expect(
        service.verify(userId, channelType, verifyUserDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if OTP has been verified', async () => {
      const userId = 'user123';
      const channelType = prisma.$Enums.ChannelType.EMAIL;
      const verifyUserDto = { otpCode: '123456' };
      const mostRecentOtp = {
        id: 1,
        otpCode: '123456',
        verifiedAt: new Date(),
        expiredAt: new Date(),
        userId,
        channelType,
        createdAt: new Date(),
      };

      prismaService.otp.findFirst.mockResolvedValueOnce(mostRecentOtp);

      await expect(
        service.verify(userId, channelType, verifyUserDto),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException if OTP has expired', async () => {
      const userId = 'user123';
      const channelType = prisma.$Enums.ChannelType.EMAIL;
      const verifyUserDto = { otpCode: '123456' };
      const expiredOtp = {
        id: 1,
        otpCode: '123456',
        verifiedAt: null,
        expiredAt: new Date(new Date().getTime() - 10000),
        userId,
        channelType,
        createdAt: new Date(),
      };

      prismaService.otp.findFirst.mockResolvedValueOnce(expiredOtp);

      await expect(
        service.verify(userId, channelType, verifyUserDto),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException if OTP code is incorrect', async () => {
      const userId = 'user123';
      const channelType = prisma.$Enums.ChannelType.EMAIL;
      const verifyUserDto = { otpCode: 'wrongOtp' };
      const mostRecentOtp = {
        id: 1,
        otpCode: '123456',
        verifiedAt: null,
        expiredAt: new Date(),
        userId,
        channelType,
        createdAt: new Date(),
      };

      prismaService.otp.findFirst.mockResolvedValueOnce(mostRecentOtp);

      await expect(
        service.verify(userId, channelType, verifyUserDto),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('findAllByUserId', () => {
    it('should return accounts for a given userId excluding system user', async () => {
      const userId = 'user123';
      const mockAccounts = [
        {
          id: 'acc1',
          userId,
          channelType: prisma.ChannelType.EMAIL,
          channelToken: 'token1',
          createdAt: new Date(),
          updatedAt: new Date(),
          verifiedAt: new Date(),
        },
        {
          id: 'acc2',
          userId,
          channelType: prisma.ChannelType.EMAIL,
          channelToken: 'token2',
          createdAt: new Date(),
          updatedAt: new Date(),
          verifiedAt: new Date(),
        },
      ];

      prismaService.account.findMany.mockResolvedValueOnce(mockAccounts);

      await expect(service.findAllByUserId(userId)).resolves.toEqual(
        mockAccounts,
      );
      expect(prismaService.account.findMany).toHaveBeenCalledWith({
        where: {
          AND: [
            { userId },
            {
              userId: { not: config.SYSTEM_USER_ID },
            },
          ],
        },
      });
    });
  });

  describe('remove', () => {
    it('should remove an account for a given userId and channelType excluding system user', async () => {
      const userId = 'user123';
      const channelType = prisma.$Enums.ChannelType.EMAIL;

      const mockDeleteResponse = {
        id: 'acc1',
        userId,
        channelType,
        channelToken: 'token1',
        createdAt: new Date(),
        updatedAt: new Date(),
        verifiedAt: new Date(),
      };

      prismaService.account.delete.mockResolvedValueOnce(mockDeleteResponse);

      await expect(service.remove(userId, channelType)).resolves.toEqual(
        mockDeleteResponse,
      );
      expect(prismaService.account.delete).toHaveBeenCalledWith({
        where: {
          userId: { not: config.SYSTEM_USER_ID },
          userId_channelType: { userId, channelType },
        },
      });
    });
  });
});
