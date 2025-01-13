import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { kebabCase } from 'lodash';
import { PrismaService } from 'nestjs-prisma';
import { CreateNotificationCategoryDto } from './dto/create-notification-category.dto';
import { UpdateNotificationCategoryDto } from './dto/update-notification-category.dto';

@Injectable()
export class NotificationCategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  create(
    applicationId: string,
    createNotificationCategoryDto: CreateNotificationCategoryDto,
    user: User,
  ) {
    const id =
      kebabCase(createNotificationCategoryDto.name) +
      '-' +
      new Date().getTime();
    return this.prisma.notificationCategory.create({
      data: {
        ...createNotificationCategoryDto,
        createdByUserId: user.id,
        updatedByUserId: user.id,
        applicationId,
        id,
      },
    });
  }

  findAll() {
    return this.prisma.notificationCategory.findMany();
  }

  findAllByApplicationId(applicationId: string) {
    return this.prisma.notificationCategory.findMany({
      where: {
        applicationId,
      },
    });
  }

  findOne(id: string) {
    return this.prisma.notificationCategory.findUniqueOrThrow({
      where: {
        id,
      },
    });
  }

  update(
    id: string,
    updateNotificationCategoryDto: UpdateNotificationCategoryDto,
    user: User,
  ) {
    return this.prisma.notificationCategory.update({
      where: {
        id,
      },
      data: {
        ...updateNotificationCategoryDto,
        updatedByUserId: user.id,
      },
    });
  }

  delete(id: string, user: User) {
    return this.prisma.notificationCategory.update({
      where: {
        id,
      },
      data: {
        updatedByUserId: user.id,
        deletedByUserId: user.id,
        deletedAt: new Date(),
      },
    });
  }
}
