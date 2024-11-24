import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule } from '@nestjs/config';
import { Config } from '@/utils/config/config-dto';

@Module({
  providers: [NotificationsService],
  exports: [NotificationsService],
  imports: [
    ClientsModule.registerAsync([
      {
        imports: [ConfigModule],
        name: 'ChannelSenderService',
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
