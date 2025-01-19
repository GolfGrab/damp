import { Auth, GetUser } from '@/auth/auth.decorator';
import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { User } from '@prisma/client';
import { ApplicationsService } from './applications/applications.service';
import { CreateApplicationDto } from './applications/dto/create-application.dto';
import { UpdateApplicationDto } from './applications/dto/update-application.dto';
import { ApplicationWithApiKey } from './applications/entities/application-with-api-key';
import { Application } from './applications/entities/application.entity';
import { CreateNotificationCategoryDto } from './notification-categories/dto/create-notification-category.dto';
import { UpdateNotificationCategoryDto } from './notification-categories/dto/update-notification-category.dto';
import { NotificationCategory } from './notification-categories/entities/notification-category.entity';
import { NotificationCategoriesService } from './notification-categories/notification-categories.service';

@ApiTags('Application Module')
@Controller('m-application')
export class MApplicationController {
  constructor(
    private readonly applicationsService: ApplicationsService,
    private readonly notificationCategoriesService: NotificationCategoriesService,
  ) {}

  /**
   * Applications
   **/

  @Auth()
  @Post('applications')
  createApplication(
    @Body() createApplicationDto: CreateApplicationDto,
    @GetUser() user: User,
  ): Promise<ApplicationWithApiKey> {
    return this.applicationsService.create(createApplicationDto, user);
  }

  @Auth()
  @Get('applications')
  findAllApplications(): Promise<Application[]> {
    return this.applicationsService.findAll();
  }

  @Auth()
  @Get('users/:createdByUserId/applications')
  findAllApplicationsByUserId(
    @Param('createdByUserId') createdByUserId: string,
  ): Promise<Application[]> {
    return this.applicationsService.findAllByCreatedByUserId(createdByUserId);
  }

  @Auth()
  @Get('applications/:applicationId')
  findOneApplication(
    @Param('applicationId') applicationId: string,
  ): Promise<ApplicationWithApiKey> {
    return this.applicationsService.findOne(applicationId);
  }

  @Auth()
  @Patch('applications/:applicationId')
  updateApplication(
    @Param('applicationId') applicationId: string,
    @Body() updateApplicationDto: UpdateApplicationDto,
    @GetUser() user: User,
  ): Promise<ApplicationWithApiKey> {
    return this.applicationsService.update(
      applicationId,
      updateApplicationDto,
      user,
    );
  }

  @Auth()
  @Patch('applications/:applicationId/rotate-api-key')
  rotateApiKey(
    @Param('applicationId') applicationId: string,
    @GetUser() user: User,
  ): Promise<ApplicationWithApiKey> {
    return this.applicationsService.rotateApiKey(applicationId, user);
  }

  /**
   * Notification Categories
   **/

  @Auth()
  @Post('applications/:applicationId/notification-categories')
  createNotificationCategory(
    @Param('applicationId') applicationId: string,
    @Body() createNotificationCategoryDto: CreateNotificationCategoryDto,
    @GetUser() user: User,
  ): Promise<NotificationCategory> {
    return this.notificationCategoriesService.create(
      applicationId,
      createNotificationCategoryDto,
      user,
    );
  }

  @Auth()
  @Get('notification-categories')
  findAllNotificationCategories(): Promise<NotificationCategory[]> {
    return this.notificationCategoriesService.findAll();
  }

  @Auth()
  @Get('applications/:applicationId/notification-categories')
  findAllNotificationCategoriesByApplicationId(
    @Param('applicationId') applicationId: string,
  ): Promise<NotificationCategory[]> {
    return this.notificationCategoriesService.findAllByApplicationId(
      applicationId,
    );
  }

  @Get('notification-categories/:notificationCategoryId')
  findOneNotificationCategory(
    @Param('notificationCategoryId') notificationCategoryId: string,
  ): Promise<NotificationCategory> {
    return this.notificationCategoriesService.findOne(notificationCategoryId);
  }

  @Auth()
  @Patch('notification-categories/:notificationCategoryId')
  updateNotificationCategory(
    @Param('notificationCategoryId') notificationCategoryId: string,
    @Body() updateNotificationCategoryDto: UpdateNotificationCategoryDto,
    @GetUser() user: User,
  ): Promise<NotificationCategory> {
    return this.notificationCategoriesService.update(
      notificationCategoryId,
      updateNotificationCategoryDto,
      user,
    );
  }
}
