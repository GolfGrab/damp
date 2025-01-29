import { NotificationsModule } from '@/modules/m-notification/notifications/notifications.module';
import { Module } from '@nestjs/common';
import { AccountsService } from './accounts.service';

@Module({
  providers: [AccountsService],
  exports: [AccountsService],
  imports: [NotificationsModule],
})
export class AccountsModule {}
