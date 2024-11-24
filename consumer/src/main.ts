import { ParseJsonPipe } from '@/pipe/ParseJson.pipe';
import { loggerOption } from '@/utils/logger/loggerOption';
import { generateSwaggerDoc } from '@/utils/swagger';
import { Logger, ValidationPipe } from '@nestjs/common';
import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { WinstonModule } from 'nest-winston';
import { PrismaClientExceptionFilter } from 'nestjs-prisma';
import { AppModule } from './app.module';
import { generateModuleGraph } from './utils/module-graph';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { Config } from './utils/config/config-dto';
import { TypedConfigModule, dotenvLoader } from 'nest-typed-config';

async function bootstrap() {
  const logger = WinstonModule.createLogger(loggerOption);

  const appContext = await NestFactory.createApplicationContext(
    TypedConfigModule.forRoot({
      schema: Config,
      isGlobal: true,
      load: [dotenvLoader()],
    }),
    {
      logger,
    },
  );

  const config = appContext.get<Config>(Config);

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.RMQ,
      options: {
        urls: [config.QUEUE_URL],
        queue: config.QUEUE_NAME,
        queueOptions: {
          durable: true,
        },
      },
    },
  );

  app.useGlobalPipes(
    new ParseJsonPipe(),
    new ValidationPipe({
      transform: true,
      exceptionFactory: (errors) => {
        return new Error(errors.toString());
      },
    }),
  );

  generateModuleGraph(app);

  await app.listen();
  Logger.log('🚀 Consumer is Running');
}

void bootstrap();
