import { NotificationsModule } from '@/modules/m-notification/notifications/notifications.module';
import { Module } from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { UserPreferencesModule } from '../user-preferences/user-preferences.module';

@Module({
  providers: [AccountsService],
  exports: [AccountsService],
  imports: [NotificationsModule,UserPreferencesModule],
})
export class AccountsModule {}
