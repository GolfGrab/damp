import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as prisma from '@prisma/client';
import { PrismaService } from 'nestjs-prisma';
import { UpsertAccountDto } from './dto/upsert-account.dto';

@Injectable()
export class AccountsService {
  constructor(private readonly prisma: PrismaService) {}

  upsert(
    userId: string,
    channelType: prisma.$Enums.ChannelType,
    upsertAccountDto: UpsertAccountDto,
  ) {
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
          create: this.prismaOtpCreateWithoutAccountInput(),
        },
        verifiedAt: null,
      },
      update: {
        channelToken: upsertAccountDto.channelToken,
        otp: {
          create:this.prismaOtpCreateWithoutAccountInput(),
        },
        verifiedAt: null,
      },
    });
  }

  prismaOtpCreateWithoutAccountInput(
    otpCode: string = Math.floor(100000 + Math.random() * 900000).toString(),
    expiredAt: Date = new Date(Date.now() + 5 * 60 * 1000),
  ) {
    return {
      otpCode,
      expiredAt,
    };
  }

  async verify(
    userId: string,
    channelType: prisma.$Enums.ChannelType,
    otpCode: string,
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
      case mostRecentOtp && mostRecentOtp.otpCode !== otpCode:
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
