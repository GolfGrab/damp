import { Module } from '@nestjs/common';
import { MNotificationSendersService } from './m-notification-senders.service';
import { MNotificationSendersController } from './m-notification-senders.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule } from '@nestjs/config';
import { Config } from '@/utils/config/config-dto';

@Module({
  controllers: [MNotificationSendersController],
  providers: [MNotificationSendersService],
  imports: [
    ClientsModule.registerAsync([
      {
        imports: [ConfigModule],
        name: 'NotificationQueueClient',
        useFactory: (config: Config) => ({
          transport: Transport.RMQ,
          options: {
            urls: [config.QUEUE_URL],
            queue: config.QUEUE_NAME,
            queueOptions: {
              durable: true,
            },
          },
        }),
        inject: [Config],
      },
    ]),
  ],
})
export class MNotificationSendersModule {}
