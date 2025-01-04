import { Injectable } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { CreateNotificationCategoryDto } from './dto/create-notification-category.dto';
import { UpdateNotificationCategoryDto } from './dto/update-notification-category.dto';

@Injectable()
export class NotificationCategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  create(
    applicationId: string,
    createNotificationCategoryDto: CreateNotificationCategoryDto,
  ) {
    return this.prisma.notificationCategory.create({
      data: {
        ...createNotificationCategoryDto,
        applicationId,
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
  ) {
    return this.prisma.notificationCategory.update({
      where: {
        id,
      },
      data: updateNotificationCategoryDto,
    });
  }
}
