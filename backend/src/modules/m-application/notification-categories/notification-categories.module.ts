import { Module } from '@nestjs/common';
import { NotificationCategoriesService } from './notification-categories.service';

@Module({
  providers: [NotificationCategoriesService],
  exports: [NotificationCategoriesService],
})
export class NotificationCategoriesModule {}
