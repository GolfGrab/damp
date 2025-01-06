import { Injectable } from '@nestjs/common';
import * as prisma from '@prisma/client';
import { PrismaService } from 'nestjs-prisma';
import { UpsertUserPreferenceDto } from './dto/upsert-user-preference.dto';

@Injectable()
export class UserPreferencesService {
  constructor(private readonly prisma: PrismaService) {}

  upsert(
    userId: string,
    notificationCategoryId: string,
    channelType: prisma.$Enums.ChannelType,
    upsertUserPreferenceDto: UpsertUserPreferenceDto,
  ) {
    return this.prisma.userPreference.upsert({
      where: {
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
        userId,
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
      },
      data: {
        ...upsertUserPreferenceDto,
      },
    });
  }
}
