import { GetApplication, KeyAuth } from '@/auth/auth.decorator';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Application, MessageType } from '@prisma/client';
import { CreateNotificationDto } from './notifications/dto/create-notification.dto';
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

  @Post('templates')
  createTemplate(
    @Body() createTemplateDto: CreateTemplateDto,
  ): Promise<Template> {
    return this.templatesService.create(createTemplateDto);
  }

  @Get('templates')
  findAllTemplates(): Promise<Template[]> {
    return this.templatesService.findAll();
  }

  @Get('templates/:templateId')
  findOneTemplate(@Param('templateId') templateId: number): Promise<Template> {
    return this.templatesService.findOne(templateId);
  }

  @Patch('templates/:templateId')
  updateTemplate(
    @Param('templateId') templateId: number,
    @Body() updateTemplateDto: UpdateTemplateDto,
  ): Promise<Template> {
    return this.templatesService.update(templateId, updateTemplateDto);
  }

  @Delete('templates/:templateId')
  removeTemplate(@Param('templateId') templateId: number) {
    return this.templatesService.remove(templateId);
  }

  @ApiParam({
    name: 'messageType',
    required: true,
    enum: MessageType,
  })
  @Post('templates/:templateId/messageType/:messageType/preview')
  previewTemplate(
    @Param('templateId') templateId: number,
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
    @Param('applicationId') applicationId: number,
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
    @Param('applicationId') applicationId: number,
  ): Promise<Notification[]> {
    return this.notificationsService.findAllByApplicationId(applicationId);
  }

  @Get('templates/:templateId/notifications')
  findAllNotificationsByTemplateId(
    @Param('templateId') templateId: number,
  ): Promise<Notification[]> {
    return this.notificationsService.findAllByTemplateId(templateId);
  }

  @Get('notification-categories/:notificationCategoryId/notifications')
  findAllNotificationsByNotificationCategoryId(
    @Param('notificationCategoryId') notificationCategoryId: number,
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
}
