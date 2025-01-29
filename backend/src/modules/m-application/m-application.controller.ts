import { Role, Roles } from '@/auth/auth-roles.decorator';
import { Auth, GetUser } from '@/auth/auth.decorator';
import { UserWithRoles } from '@/auth/UserWithRoles';
import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ApplicationsService } from './applications/applications.service';
import { CreateApplicationDto } from './applications/dto/create-application.dto';
import { UpdateApplicationDto } from './applications/dto/update-application.dto';
import { ApplicationWithApiKey } from './applications/entities/application-with-api-key.entity';
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
  @Roles(Role.Admin, Role.Developer)
  @Post('applications')
  createApplication(
    @Body() createApplicationDto: CreateApplicationDto,
    @GetUser() user: UserWithRoles,
  ): Promise<ApplicationWithApiKey> {
    return this.applicationsService.create(createApplicationDto, user);
  }

  @Auth()
  @Roles(Role.Admin, Role.Developer)
  @Get('applications')
  findAllApplications(@GetUser() user: UserWithRoles): Promise<Application[]> {
    return this.applicationsService.findAll(user);
  }

  @Auth()
  @Roles(Role.Admin, Role.Developer)
  @Get('applications/:applicationId')
  findOneApplication(
    @Param('applicationId') applicationId: string,
    @GetUser() user: UserWithRoles,
  ): Promise<ApplicationWithApiKey> {
    return this.applicationsService.findOne(applicationId, user);
  }

  @Auth()
  @Patch('applications/:applicationId')
  updateApplication(
    @Param('applicationId') applicationId: string,
    @Body() updateApplicationDto: UpdateApplicationDto,
    @GetUser() user: UserWithRoles,
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
    @GetUser() user: UserWithRoles,
  ): Promise<ApplicationWithApiKey> {
    return this.applicationsService.rotateApiKey(applicationId, user);
  }

  /**
   * Notification Categories
   **/

  @Auth()
  @Roles(Role.Admin, Role.Developer)
  @Post('applications/:applicationId/notification-categories')
  createNotificationCategory(
    @Param('applicationId') applicationId: string,
    @Body() createNotificationCategoryDto: CreateNotificationCategoryDto,
    @GetUser() user: UserWithRoles,
  ): Promise<NotificationCategory> {
    return this.notificationCategoriesService.create(
      applicationId,
      createNotificationCategoryDto,
      user,
    );
  }

  @Auth()
  @Get('applications/:applicationId/notification-categories')
  findAllNotificationCategoriesByApplicationId(
    @Param('applicationId') applicationId: string,
    @GetUser() user: UserWithRoles,
  ): Promise<NotificationCategory[]> {
    return this.notificationCategoriesService.findAllByApplicationId(
      applicationId,
      user,
    );
  }

  @Auth()
  @Roles(Role.Admin, Role.Developer)
  @Patch('notification-categories/:notificationCategoryId')
  updateNotificationCategory(
    @Param('notificationCategoryId') notificationCategoryId: string,
    @Body() updateNotificationCategoryDto: UpdateNotificationCategoryDto,
    @GetUser() user: UserWithRoles,
  ): Promise<NotificationCategory> {
    return this.notificationCategoriesService.update(
      notificationCategoryId,
      updateNotificationCategoryDto,
      user,
    );
  }
}
