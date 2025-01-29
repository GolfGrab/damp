import { NotificationsService } from '@/modules/m-notification/notifications/notifications.service';
import { Config } from '@/utils/config/config-dto';
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as prisma from '@prisma/client';
import { PrismaService } from 'nestjs-prisma';
import { VerifyUserDto } from '../users/dto/verify-user.dto';
import { UpsertAccountDto } from './dto/upsert-account.dto';

@Injectable()
export class AccountsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationService: NotificationsService,
    private readonly config: Config,
  ) {}

  generateOtp() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async upsert(
    userId: string,
    channelType: prisma.$Enums.ChannelType,
    upsertAccountDto: UpsertAccountDto,
  ) {
    const otpCode = this.generateOtp();
    const expiredAt = new Date(
      new Date().getTime() + 1000 * 60 * 5, // 5 minutes
    );

    const prismaOtpCreateWithoutAccountInput = {
      otpCode,
      expiredAt,
    };

    const account = await this.prisma.account.upsert({
      where: {
        userId_channelType: {
          userId,
          channelType,
        },
      },
      create: {
        userId,
        channelType,
        channelToken: upsertAccountDto.channelToken,
        otp: {
          create: prismaOtpCreateWithoutAccountInput,
        },
        verifiedAt: null,
      },
      update: {
        channelToken: upsertAccountDto.channelToken,
        otp: {
          create: prismaOtpCreateWithoutAccountInput,
        },
        verifiedAt: null,
      },
    });

    // send otp code to user
    await this.notificationService.create('System-application', {
      recipientIds: [userId],
      notificationCategoryId: `System_${channelType}_OTP`,
      priority: prisma.Priority.HIGH,
      templateId: `System_${channelType}_OTP`,
      templateData: {
        otpCode,
      },
    });

    return account;
  }

  async createNewOtp(userId: string, channelType: prisma.$Enums.ChannelType) {
    const account = await this.prisma.account.findUnique({
      where: {
        userId_channelType: {
          userId,
          channelType,
        },
      },
    });

    if (!account) {
      throw new NotFoundException('Account not found');
    }

    if (account.verifiedAt) {
      throw new ForbiddenException('Account has been verified');
    }

    const otpCode = this.generateOtp();
    const expiredAt = new Date(
      new Date().getTime() + 1000 * 60 * 5, // 5 minutes
    );

    await this.prisma.account.update({
      where: {
        userId_channelType: {
          userId,
          channelType,
        },
      },
      data: {
        otp: {
          create: {
            otpCode,
            expiredAt,
          },
        },
      },
    });

    // send otp code to user
    await this.notificationService.create('System-application', {
      recipientIds: [userId],
      notificationCategoryId: `System_${channelType}_OTP`,
      priority: prisma.Priority.HIGH,
      templateId: `System_${channelType}_OTP`,
      templateData: {
        otpCode,
      },
    });

    return account;
  }

  async verify(
    userId: string,
    channelType: prisma.$Enums.ChannelType,
    verifyUserDto: VerifyUserDto,
  ) {
    const mostRecentOtp = await this.prisma.otp.findFirst({
      where: {
        account: {
          userId: userId,
          channelType: channelType,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    switch (true) {
      case !mostRecentOtp:
        throw new NotFoundException('OTP not found');
      case mostRecentOtp?.verifiedAt !== null:
        throw new ForbiddenException('OTP has been verified');
      case mostRecentOtp && mostRecentOtp.expiredAt < new Date():
        throw new ForbiddenException('OTP has expired');
      case mostRecentOtp && mostRecentOtp.otpCode !== verifyUserDto.otpCode:
        throw new ForbiddenException('OTP code is incorrect');
    }

    return this.prisma.account.update({
      where: {
        userId_channelType: {
          userId,
          channelType,
        },
      },
      data: {
        verifiedAt: new Date(),
        otp: {
          update: {
            where: {
              id: mostRecentOtp.id,
            },
            data: {
              verifiedAt: new Date(),
            },
          },
        },
      },
    });
  }

  findAllByUserId(userId: string) {
    return this.prisma.account.findMany({
      where: {
        AND: [
          { userId },
          {
            userId: {
              not: this.config.SYSTEM_USER_ID,
            },
          },
        ],
      },
    });
  }

  remove(userId: string, channelType: prisma.$Enums.ChannelType) {
    return this.prisma.account.delete({
      where: {
        userId: {
          not: this.config.SYSTEM_USER_ID,
        },
        userId_channelType: {
          userId,
          channelType,
        },
      },
    });
  }
}
