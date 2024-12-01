import { Config } from '@/utils/config/config-dto';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { NotificationsService } from './notifications.service';

@Module({
  providers: [NotificationsService],
  exports: [NotificationsService],
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
export class NotificationsModule {}
