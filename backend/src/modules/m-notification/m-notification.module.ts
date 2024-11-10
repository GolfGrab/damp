import { Module } from '@nestjs/common';
import { MNotificationController } from './m-notification.controller';
import { NotificationsModule } from './notifications/notifications.module';
import { TemplatesModule } from './templates/templates.module';

@Module({
  controllers: [MNotificationController],
  imports: [NotificationsModule, TemplatesModule],
})
export class MNotificationModule {}
