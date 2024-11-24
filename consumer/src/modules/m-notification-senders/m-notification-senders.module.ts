import { Module } from '@nestjs/common';
import { MNotificationSendersService } from './m-notification-senders.service';
import { MNotificationSendersController } from './m-notification-senders.controller';

@Module({
  controllers: [MNotificationSendersController],
  providers: [MNotificationSendersService],
})
export class MNotificationSendersModule {}
