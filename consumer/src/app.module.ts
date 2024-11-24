import { Config } from '@/utils/config/config-dto';
import { RequestLoggerMiddleware } from '@/utils/logger/request-logger.middleware';
import { MiddlewareConsumer, Module } from '@nestjs/common';
import { TypedConfigModule, dotenvLoader } from 'nest-typed-config';
import { PrismaModule } from 'nestjs-prisma';
import { MNotificationSendersModule } from './modules/m-notification-senders/m-notification-senders.module';

@Module({
  imports: [
    PrismaModule.forRoot({
      isGlobal: true,
    }),
    TypedConfigModule.forRoot({
      schema: Config,
      isGlobal: true,
      load: [dotenvLoader()],
    }),
    MNotificationSendersModule,
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestLoggerMiddleware).forRoutes('*');
  }
}
