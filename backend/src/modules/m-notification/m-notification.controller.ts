import { UserWithRoles } from '@/auth/UserWithRoles';
import { Role, Roles } from '@/auth/auth-roles.decorator';
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
import { Application, MessageType } from '@prisma/client';
import { ApiPaginatedResponse } from '../../utils/paginator/pagination.decorator';
import { PaginatedResult } from '../../utils/paginator/pagination.type';
import { PaginationQueryDto } from '../../utils/paginator/paginationQuery.dto';
import { CreateNotificationDto } from './notifications/dto/create-notification.dto';
import { NotificationTasksOrderDto } from './notifications/dto/notification-tasks-order.dto';
import { OutputNotificationWithCompiledMessageAndNotificationTaskDto } from './notifications/dto/output-notification-with-compiled-message-and-notification-task.dto';
import { NotificationTask } from './notifications/entities/notification-task.entity';
import { Notification } from './notifications/entities/notification.entity';
import { NotificationsService } from './notifications/notifications.service';
import { CreateTemplateDto } from './templates/dto/create-template.dto';
import { GetPreviewTemplateDto } from './templates/dto/get-preview-template.dto';
import { UpdateTemplateDto } from './templates/dto/update-template.dto';
import { Template } from './templates/entities/template.entity';
import { TemplatesService } from './templates/templates.service';

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

  @Auth()
  @Roles(Role.Admin, Role.Developer)
  @Post('templates')
  createTemplate(
    @Body() createTemplateDto: CreateTemplateDto,
    @GetUser() user: UserWithRoles,
  ): Promise<Template> {
    return this.templatesService.create(createTemplateDto, user);
  }

  @Auth()
  @Roles(Role.Admin, Role.Developer)
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

  @Auth()
  @Roles(Role.Admin, Role.Developer)
  @Get('templates/:templateId')
  findOneTemplate(@Param('templateId') templateId: string): Promise<Template> {
    return this.templatesService.findOne(templateId);
  }

  @Auth()
  @Roles(Role.Admin, Role.Developer)
  @Patch('templates/:templateId')
  updateTemplate(
    @Param('templateId') templateId: string,
    @Body() updateTemplateDto: UpdateTemplateDto,
    @GetUser() user: UserWithRoles,
  ): Promise<Template> {
    return this.templatesService.update(templateId, updateTemplateDto, user);
  }

  @Auth()
  @Roles(Role.Admin, Role.Developer)
  @Delete('templates/:templateId')
  @Auth()
  deleteTemplate(
    @Param('templateId') templateId: string,
    @GetUser() user: UserWithRoles,
  ): Promise<Template> {
    return this.templatesService.delete(templateId, user);
  }

  @Auth()
  @Roles(Role.Admin, Role.Developer)
  @ApiParam({
    name: 'messageType',
    required: true,
    enum: MessageType,
  })
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

  @Auth()
  @ApiPaginatedResponse(
    OutputNotificationWithCompiledMessageAndNotificationTaskDto,
  )
  @Get('users/:userId/notifications')
  getPaginatedNotificationsByUserId(
    @Query() paginateQuery: PaginationQueryDto,
    @Param('userId') userId: string,
    @GetUser() user: UserWithRoles,
  ): Promise<
    PaginatedResult<OutputNotificationWithCompiledMessageAndNotificationTaskDto>
  > {
    if (user.id !== userId) {
      throw new UnauthorizedException('Invalid user access');
    }

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
    @GetUser() user: UserWithRoles,
    @Param('userId') userId: string,
    @Param('notificationId') notificationId: number,
  ): Promise<OutputNotificationWithCompiledMessageAndNotificationTaskDto> {
    if (user.id !== userId) {
      throw new UnauthorizedException('Invalid user access');
    }

    return this.notificationsService.findOneByUser(user.id, notificationId);
  }

  @Auth()
  @Roles(Role.Admin, Role.Developer)
  @ApiPaginatedResponse(NotificationTask)
  @Get('applications/:applicationId/notification-tasks')
  findAllNotificationTasksByApplicationIdPaginated(
    @Param('applicationId') applicationId: string,
    @Query() paginateQuery: PaginationQueryDto,
    @Query() notificationTasksOrderDto: NotificationTasksOrderDto,
    @GetUser() user: UserWithRoles,
  ): Promise<PaginatedResult<NotificationTask>> {
    return this.notificationsService.findAllNotificationTasksByApplicationIdPaginated(
      applicationId,
      paginateQuery,
      notificationTasksOrderDto,
      user,
    );
  }
}
