import { Config } from '@/utils/config/config-dto';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { $Enums } from '@prisma/client';
import { TemplatesModule } from '../templates/templates.module';
import { NotificationsService } from './notifications.service';

@Module({
  providers: [NotificationsService],
  exports: [NotificationsService],
  imports: [
    TemplatesModule,
    ...Object.values($Enums.ChannelType).map((channelType) =>
      ClientsModule.registerAsync([
        {
          name: `NotificationQueueClient${channelType}`,
          imports: [ConfigModule],
          useFactory: (config: Config) => ({
            transport: Transport.RMQ,
            options: {
              urls: [config.QUEUE_URL],
              queue: `${config.QUEUE_PREFIX}-${channelType}`,
              queueOptions: {
                durable: true,
              },
            },
          }),
          inject: [Config],
        },
      ]),
    ),
  ],
})
export class NotificationsModule {}
