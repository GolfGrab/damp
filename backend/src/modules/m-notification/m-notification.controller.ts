import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JSONContent } from '@tiptap/core';
import { CreateNotificationDto } from './notifications/dto/create-notification.dto';
import { Notification } from './notifications/entities/notification.entity';
import { NotificationsService } from './notifications/notifications.service';
import { CreateTemplateDto } from './templates/dto/create-template.dto';
import { UpdateTemplateDto } from './templates/dto/update-template.dto';
import { Template } from './templates/entities/template.entity';
import { TemplatesParserService } from './templates/template-parser.service';
import { TemplatesRendererService } from './templates/template-renderer.service';
import { TemplatesService } from './templates/templates.service';

@ApiTags('Notification Module')
@Controller('m-notification')
export class MNotificationController {
  constructor(
    private readonly templatesService: TemplatesService,
    private readonly notificationsService: NotificationsService,
    private readonly templatesParserService: TemplatesParserService,
    private readonly templatesRendererService: TemplatesRendererService,
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

  @ApiBody({})
  @Post('templates/HTML/preview')
  previewHTMLTemplate(@Body() payload: JSONContent) {
    const template = this.templatesParserService.parseJSONToMarkdown(payload);
    return this.templatesRendererService.render(template, {
      name: 'John Doe',
    });
  }

  /**
   * Notifications
   **/

  @ApiResponse({
    status: 201,
    description: 'The record has been successfully created.',
    type: Notification,
  })
  @Post('applications/:applicationId/notifications')
  createNotification(
    @Param('applicationId') applicationId: number,
    @Body() createNotificationDto: CreateNotificationDto,
  ): Promise<Notification | null> {
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
