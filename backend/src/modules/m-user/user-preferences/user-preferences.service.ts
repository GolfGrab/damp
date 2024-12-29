import { Injectable } from '@nestjs/common';
import { CreateUserPreferenceDto } from './dto/create-user-preference.dto';
import { UpdateUserPreferenceDto } from './dto/update-user-preference.dto';
import * as prisma from '@prisma/client';
import { PrismaService } from 'nestjs-prisma';

@Injectable()
export class UserPreferencesService {
  constructor(private readonly prisma: PrismaService) {}

  create(
    userId: string,
    notificationCategoryId: string,
    channelType: prisma.$Enums.ChannelType,
    createUserPreferenceDto: CreateUserPreferenceDto,
  ) {
    return this.prisma.userPreference.create({
      data: {
        userId,
        notificationCategoryId,
        channelType,
        ...createUserPreferenceDto,
      },
    });
  }

  findAll() {
    return this.prisma.userPreference.findMany();
  }

  findAllByUserId(userId: string) {
    return this.prisma.userPreference.findMany({
      where: {
        userId,
      },
    });
  }

  findOne(
    userId: string,
    notificationCategoryId: string,
    channelType: prisma.$Enums.ChannelType,
  ) {
    return this.prisma.userPreference.findUniqueOrThrow({
      where: {
        userId_channelType_notificationCategoryId: {
          userId,
          channelType,
          notificationCategoryId,
        },
      },
    });
  }

  update(
    userId: string,
    notificationCategoryId: string,
    channelType: prisma.$Enums.ChannelType,
    updateUserPreferenceDto: UpdateUserPreferenceDto,
  ) {
    return this.prisma.userPreference.update({
      where: {
        userId_channelType_notificationCategoryId: {
          userId,
          channelType,
          notificationCategoryId,
        },
      },
      data: updateUserPreferenceDto,
    });
  }
}
