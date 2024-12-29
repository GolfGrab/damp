import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ApplicationsService } from './applications/applications.service';
import { CreateApplicationDto } from './applications/dto/create-application.dto';
import { UpdateApplicationDto } from './applications/dto/update-application.dto';
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

  @Post('applications')
  createApplication(
    @Body() createApplicationDto: CreateApplicationDto,
  ): Promise<Application> {
    return this.applicationsService.create(createApplicationDto);
  }

  @Get('applications')
  findAllApplications(): Promise<Application[]> {
    return this.applicationsService.findAll();
  }

  @Get('users/:createdByUserId/applications')
  findAllApplicationsByUserId(
    @Param('createdByUserId') createdByUserId: string,
  ): Promise<Application[]> {
    return this.applicationsService.findAllByCreatedByUserId(createdByUserId);
  }

  @Get('applications/:applicationId')
  findOneApplication(
    @Param('applicationId') applicationId: string,
  ): Promise<Application> {
    return this.applicationsService.findOne(applicationId);
  }

  @Patch('applications/:applicationId')
  updateApplication(
    @Param('applicationId') applicationId: string,
    @Body() updateApplicationDto: UpdateApplicationDto,
  ): Promise<Application> {
    return this.applicationsService.update(applicationId, updateApplicationDto);
  }

  @Patch('applications/:applicationId/rotate-api-key')
  rotateApiKey(@Param('applicationId') applicationId: string) {
    return this.applicationsService.rotateApiKey(applicationId);
  }

  /**
   * Notification Categories
   **/

  @Post('applications/:applicationId/notification-categories')
  createNotificationCategory(
    @Param('applicationId') applicationId: string,
    @Body() createNotificationCategoryDto: CreateNotificationCategoryDto,
  ): Promise<NotificationCategory> {
    return this.notificationCategoriesService.create(
      applicationId,
      createNotificationCategoryDto,
    );
  }

  @Get('notification-categories')
  findAllNotificationCategories(): Promise<NotificationCategory[]> {
    return this.notificationCategoriesService.findAll();
  }

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

  @Patch('notification-categories/:notificationCategoryId')
  updateNotificationCategory(
    @Param('notificationCategoryId') notificationCategoryId: string,
    @Body() updateNotificationCategoryDto: UpdateNotificationCategoryDto,
  ): Promise<NotificationCategory> {
    return this.notificationCategoriesService.update(
      notificationCategoryId,
      updateNotificationCategoryDto,
    );
  }
}
