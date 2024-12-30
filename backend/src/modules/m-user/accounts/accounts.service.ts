import { NotificationsService } from '@/modules/m-notification/notifications/notifications.service';
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as prisma from '@prisma/client';
import { PrismaService } from 'nestjs-prisma';
import { UserPreferencesService } from '../user-preferences/user-preferences.service';
import { VerifyUserDto } from '../users/dto/verify-user.dto';
import { UpsertAccountDto } from './dto/upsert-account.dto';

@Injectable()
export class AccountsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationService: NotificationsService,
    private readonly userPreferencesService: UserPreferencesService,
  ) {}

  async upsert(
    userId: string,
    channelType: prisma.$Enums.ChannelType,
    upsertAccountDto: UpsertAccountDto,
  ) {
    const otpCode = this.generateOtp();
    const expiredAt = new Date(
      new Date().getTime() + 1000 * 60 * 5, // 5 minutes
    );

    // set user preferences for OTP
    await this.userPreferencesService.upsert(
      userId,
      `System_${channelType}_OTP`,
      channelType,
      {
        isPreferred: true,
      },
    );

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

    const prismaOtpCreateWithoutAccountInput = {
      otpCode,
      expiredAt,
    };

    return this.prisma.account.upsert({
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
  }

  generateOtp() {
    return Math.floor(100000 + Math.random() * 900000).toString();
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

  findAll() {
    return this.prisma.account.findMany();
  }

  findAllByUserId(userId: string) {
    return this.prisma.account.findMany({
      where: {
        userId,
      },
    });
  }

  findOne(userId: string, channelType: prisma.$Enums.ChannelType) {
    return this.prisma.account.findUniqueOrThrow({
      where: {
        userId_channelType: {
          userId,
          channelType,
        },
      },
    });
  }

  remove(userId: string, channelType: prisma.$Enums.ChannelType) {
    return this.prisma.account.delete({
      where: {
        userId_channelType: {
          userId,
          channelType,
        },
      },
    });
  }
}
