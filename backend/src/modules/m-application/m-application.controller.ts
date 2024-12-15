import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApplicationsService } from './applications/applications.service';
import { CreateApplicationDto } from './applications/dto/create-application.dto';
import { CreateNotificationCategoryDto } from './notification-categories/dto/create-notification-category.dto';
import { NotificationCategoriesService } from './notification-categories/notification-categories.service';
import { UpdateApplicationDto } from './applications/dto/update-application.dto';
import { UpdateNotificationCategoryDto } from './notification-categories/dto/update-notification-category.dto';
import { Application } from './applications/entities/application.entity';
import { NotificationCategory } from './notification-categories/entities/notification-category.entity';
import { ApiParam, ApiTags } from '@nestjs/swagger';

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
    @Param('applicationId') applicationId: number,
  ): Promise<Application> {
    return this.applicationsService.findOne(applicationId);
  }

  @Patch('applications/:applicationId')
  updateApplication(
    @Param('applicationId') applicationId: number,
    @Body() updateApplicationDto: UpdateApplicationDto,
  ): Promise<Application> {
    return this.applicationsService.update(applicationId, updateApplicationDto);
  }

  @Patch('applications/:applicationId/rotate-api-key')
  rotateApiKey(@Param('applicationId') applicationId: number) {
    return this.applicationsService.rotateApiKey(applicationId);
  }

  @Delete('applications/:applicationId')
  removeApplication(@Param('applicationId') applicationId: number) {
    return this.applicationsService.remove(applicationId);
  }

  /**
   * Notification Categories
   **/

  @Post('applications/:applicationId/notification-categories')
  createNotificationCategory(
    @Param('applicationId') applicationId: number,
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
    @Param('applicationId') applicationId: number,
  ): Promise<NotificationCategory[]> {
    return this.notificationCategoriesService.findAllByApplicationId(
      applicationId,
    );
  }

  @Get('notification-categories/:notificationCategoryId')
  findOneNotificationCategory(
    @Param('notificationCategoryId') notificationCategoryId: number,
  ): Promise<NotificationCategory> {
    return this.notificationCategoriesService.findOne(notificationCategoryId);
  }

  @Patch('notification-categories/:notificationCategoryId')
  updateNotificationCategory(
    @Param('notificationCategoryId') notificationCategoryId: number,
    @Body() updateNotificationCategoryDto: UpdateNotificationCategoryDto,
  ): Promise<NotificationCategory> {
    return this.notificationCategoriesService.update(
      notificationCategoryId,
      updateNotificationCategoryDto,
    );
  }

  @Delete('notification-categories/:notificationCategoryId')
  removeNotificationCategory(
    @Param('notificationCategoryId') notificationCategoryId: number,
  ) {
    return this.notificationCategoriesService.remove(notificationCategoryId);
  }
}
