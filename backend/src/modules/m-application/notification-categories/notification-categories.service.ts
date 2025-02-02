import { UserWithRoles } from '@/auth/UserWithRoles';
import { Role } from '@/auth/auth-roles.decorator';
import { Config } from '@/utils/config/config-dto';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { kebabCase } from 'lodash';
import { PrismaService } from 'nestjs-prisma';
import { CreateNotificationCategoryDto } from './dto/create-notification-category.dto';
import { UpdateNotificationCategoryDto } from './dto/update-notification-category.dto';

@Injectable()
export class NotificationCategoriesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: Config,
  ) {}

  async create(
    applicationId: string,
    createNotificationCategoryDto: CreateNotificationCategoryDto,
    user: UserWithRoles,
  ) {
    const ownedApplications = await this.prisma.application.findFirst({
      where: {
        id: applicationId,
        createdByUserId: user.roles?.includes(Role.Admin) ? undefined : user.id,
      },
    });

    if (!ownedApplications) {
      throw new ForbiddenException(
        "Application doesn't exist or you are not allowed to create notification categories for this application",
      );
    }

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

  findAllByApplicationId(applicationId: string) {
    return this.prisma.notificationCategory.findMany({
      where: {
        applicationId,
        deletedAt: null,
      },
    });
  }

  update(
    id: string,
    updateNotificationCategoryDto: UpdateNotificationCategoryDto,
    user: UserWithRoles,
  ) {
    return this.prisma.notificationCategory.update({
      where: {
        id,
        application: {
          id: {
            not: this.config.SYSTEM_APPLICATION_ID,
          },
          createdByUserId: user.roles?.includes(Role.Admin)
            ? undefined
            : user.id,
        },
      },
      data: {
        ...updateNotificationCategoryDto,
        updatedByUserId: user.id,
      },
    });
  }
}
