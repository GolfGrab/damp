import { Module } from '@nestjs/common';
import { MApplicationController } from './m-application.controller';
import { ApplicationsModule } from './applications/applications.module';
import { NotificationCategoriesModule } from './notification-categories/notification-categories.module';

@Module({
  controllers: [MApplicationController],
  imports: [ApplicationsModule, NotificationCategoriesModule]
})
export class MApplicationModule {}
