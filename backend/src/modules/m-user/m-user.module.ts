import { Module } from '@nestjs/common';
import { MUserController } from './m-user.controller';
import { AccountsModule } from './accounts/accounts.module';
import { UsersModule } from './users/users.module';
import { UserPreferencesModule } from './user-preferences/user-preferences.module';

@Module({
  controllers: [MUserController],
  imports: [UsersModule, AccountsModule, UserPreferencesModule],
})
export class MUserModule {}
