import { Config } from '@/utils/config/config-dto';
import { RequestLoggerMiddleware } from '@/utils/logger/request-logger.middleware';
import { MiddlewareConsumer, Module } from '@nestjs/common';
import { TypedConfigModule, dotenvLoader } from 'nest-typed-config';
import { PrismaModule } from 'nestjs-prisma';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { MApplicationModule } from './modules/m-application/m-application.module';
import { MNotificationModule } from './modules/m-notification/m-notification.module';
import { MUserModule } from './modules/m-user/m-user.module';
import { TemplatesModule } from './modules/m-notification/templates/templates.module';

@Module({
  imports: [
    PrismaModule.forRoot({
      isGlobal: true,
      prismaServiceOptions: {
        prismaOptions: {
          omit: {
            application: {
              apiKey: true,
            },
          },
        },
      },
    }),
    TypedConfigModule.forRoot({
      schema: Config,
      isGlobal: true,
      load: [dotenvLoader()],
    }),
    AuthModule,
    MUserModule,
    MApplicationModule,
    MNotificationModule,
    TemplatesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestLoggerMiddleware).forRoutes('*');
  }
}
