import { Config } from '@/utils/config/config-dto';
import { Injectable } from '@nestjs/common';
import * as prisma from '@prisma/client';
import { PrismaService } from 'nestjs-prisma';
import { UpsertUserPreferenceDto } from './dto/upsert-user-preference.dto';

@Injectable()
export class UserPreferencesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: Config,
  ) {}

  upsert(
    userId: string,
    notificationCategoryId: string,
    channelType: prisma.$Enums.ChannelType,
    upsertUserPreferenceDto: UpsertUserPreferenceDto,
  ) {
    return this.prisma.userPreference.upsert({
      where: {
        userId: {
          not: this.config.SYSTEM_USER_ID,
        },
        notificationCategory: {
          createdByUserId: {
            not: this.config.SYSTEM_USER_ID,
          },
        },
        userId_channelType_notificationCategoryId: {
          userId,
          channelType,
          notificationCategoryId,
        },
      },
      create: {
        userId,
        notificationCategoryId,
        channelType,
        ...upsertUserPreferenceDto,
      },
      update: upsertUserPreferenceDto,
    });
  }

  findAllByUserId(userId: string) {
    return this.prisma.userPreference.findMany({
      where: {
        AND: [
          { userId: userId },
          {
            userId: {
              not: this.config.SYSTEM_USER_ID,
            },
          },
        ],
        notificationCategory: {
          createdByUserId: {
            not: this.config.SYSTEM_USER_ID,
          },
        },
      },
    });
  }

  updateManyByUserIdAndChannelType(
    userId: string,
    channelType: prisma.$Enums.ChannelType,
    upsertUserPreferenceDto: UpsertUserPreferenceDto,
  ) {
    return this.prisma.userPreference.updateMany({
      where: {
        userId,
        channelType,
        notificationCategory: {
          createdByUserId: {
            not: this.config.SYSTEM_USER_ID,
          },
        },
      },
      data: {
        ...upsertUserPreferenceDto,
      },
    });
  }
}
