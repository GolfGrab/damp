import { Auth, GetApplication, GetUser, KeyAuth } from '@/auth/auth.decorator';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Application, MessageType, User } from '@prisma/client';
import { ApiPaginatedResponse } from '../../utils/paginator/pagination.decorator';
import { PaginatedResult } from '../../utils/paginator/pagination.type';
import { PaginationQueryDto } from '../../utils/paginator/paginationQuery.dto';
import { CreateNotificationDto } from './notifications/dto/create-notification.dto';
import { OutputNotificationWithCompiledMessageAndNotificationTaskDto } from './notifications/dto/output-notification-with-compiled-message-and-notification-task.dto';
import { NotificationTask } from './notifications/entities/notification-task.entity';
import { Notification } from './notifications/entities/notification.entity';
import { NotificationsService } from './notifications/notifications.service';
import { CreateTemplateDto } from './templates/dto/create-template.dto';
import { GetPreviewTemplateDto } from './templates/dto/get-preview-template.dto';
import { UpdateTemplateDto } from './templates/dto/update-template.dto';
import { Template } from './templates/entities/template.entity';
import { TemplatesService } from './templates/templates.service';
import { NotificationTasksOrderDto } from './notifications/dto/notification-tasks-order.dto';

@ApiTags('Notification Module')
@Controller('m-notification')
export class MNotificationController {
  constructor(
    private readonly templatesService: TemplatesService,
    private readonly notificationsService: NotificationsService,
  ) {}

  /**
   * Templates
   **/

  @Post('templates')
  @Auth()
  createTemplate(
    @Body() createTemplateDto: CreateTemplateDto,
    @GetUser() user: User,
  ): Promise<Template> {
    return this.templatesService.create(createTemplateDto, user);
  }

  @Auth()
  @ApiQuery({
    name: 'templateName',
    required: false,
    type: String,
  })
  @ApiPaginatedResponse(Template)
  @Get('templates')
  findAllTemplatesPaginated(
    @Query() paginateQuery: PaginationQueryDto,
    @Query('templateName') search?: string,
  ): Promise<PaginatedResult<Template>> {
    return this.templatesService.findPaginated(
      {
        templateName: search,
      },
      paginateQuery,
    );
  }

  @Get('templates/:templateId')
  findOneTemplate(@Param('templateId') templateId: string): Promise<Template> {
    return this.templatesService.findOne(templateId);
  }

  @Patch('templates/:templateId')
  @Auth()
  updateTemplate(
    @Param('templateId') templateId: string,
    @Body() updateTemplateDto: UpdateTemplateDto,
    @GetUser() user: User,
  ): Promise<Template> {
    return this.templatesService.update(templateId, updateTemplateDto, user);
  }

  @Delete('templates/:templateId')
  @Auth()
  deleteTemplate(
    @Param('templateId') templateId: string,
    @GetUser() user: User,
  ): Promise<Template> {
    return this.templatesService.delete(templateId, user);
  }

  @ApiParam({
    name: 'messageType',
    required: true,
    enum: MessageType,
  })
  @Auth()
  @Post('templates/:templateId/messageType/:messageType/preview')
  previewTemplate(
    @Param('templateId') templateId: string,
    @Param('messageType') messageType: MessageType,
    @Body() getPreviewTemplateDto: GetPreviewTemplateDto,
  ) {
    return this.templatesService.render(
      templateId,
      messageType,
      getPreviewTemplateDto,
    );
  }

  /**
   * Notifications
   **/

  @KeyAuth()
  @ApiResponse({
    status: 201,
    description: 'The record has been successfully created.',
    type: Notification,
  })
  @Post('applications/:applicationId/notifications')
  createNotification(
    @Param('applicationId') applicationId: string,
    @Body() createNotificationDto: CreateNotificationDto,
    @GetApplication() application: Application,
  ): Promise<Notification | null> {
    if (application.id !== applicationId) {
      throw new UnauthorizedException('Invalid application access');
    }
    return this.notificationsService.create(
      applicationId,
      createNotificationDto,
    );
  }

  @Get('notifications')
  findAllNotifications(): Promise<Notification[]> {
    return this.notificationsService.findAll();
  }

  @Get('applications/:applicationId/notifications')
  findAllNotificationsByApplicationId(
    @Param('applicationId') applicationId: string,
  ): Promise<Notification[]> {
    return this.notificationsService.findAllByApplicationId(applicationId);
  }

  @Get('templates/:templateId/notifications')
  findAllNotificationsByTemplateId(
    @Param('templateId') templateId: string,
  ): Promise<Notification[]> {
    return this.notificationsService.findAllByTemplateId(templateId);
  }

  @Get('notification-categories/:notificationCategoryId/notifications')
  findAllNotificationsByNotificationCategoryId(
    @Param('notificationCategoryId') notificationCategoryId: string,
  ): Promise<Notification[]> {
    return this.notificationsService.findAllByNotificationCategoryId(
      notificationCategoryId,
    );
  }

  @Get('notifications/:notificationId')
  findOneNotification(
    @Param('notificationId') notificationId: number,
  ): Promise<Notification> {
    return this.notificationsService.findOne(notificationId);
  }

  @Auth()
  @ApiPaginatedResponse(
    OutputNotificationWithCompiledMessageAndNotificationTaskDto,
  )
  @Get('users/:userId/notifications')
  getPaginatedNotificationsByUserId(
    @Query() paginateQuery: PaginationQueryDto,
    @Param('userId') userId: string,
    @GetUser() user: User,
  ): Promise<
    PaginatedResult<OutputNotificationWithCompiledMessageAndNotificationTaskDto>
  > {
    return this.notificationsService.getPaginatedNotificationsByUser(
      user.id,
      paginateQuery,
    );
  }

  @Auth()
  @ApiResponse({
    type: OutputNotificationWithCompiledMessageAndNotificationTaskDto,
  })
  @Get('users/:userId/notifications/:notificationId')
  getNotificationsForUserById(
    @GetUser() user: User,
    @Param('userId') userId: string,
    @Param('notificationId') notificationId: number,
  ): Promise<OutputNotificationWithCompiledMessageAndNotificationTaskDto> {
    return this.notificationsService.findOneByUser(user.id, notificationId);
  }

  @Auth()
  @ApiPaginatedResponse(NotificationTask)
  @Get('applications/:applicationId/notification-tasks')
  findAllNotificationTasksByApplicationIdPaginated(
    @Param('applicationId') applicationId: string,
    @Query() paginateQuery: PaginationQueryDto,
    @Query() notificationTasksOrderDto: NotificationTasksOrderDto,
  ): Promise<PaginatedResult<NotificationTask>> {
    return this.notificationsService.findAllNotificationTasksByApplicationIdPaginated(
      applicationId,
      paginateQuery,
      notificationTasksOrderDto,
    );
  }
}
