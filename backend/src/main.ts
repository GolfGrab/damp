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

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
    {
      logger: WinstonModule.createLogger(loggerOption),
    },
  );

  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(new PrismaClientExceptionFilter(httpAdapter));
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.enableCors({
    origin: '*',
  });
  generateSwaggerDoc(app);
  generateModuleGraph(app);
  await app.listen(3000, '0.0.0.0');

  Logger.log(`🚀 Application is running on: ${await app.getUrl()}`);
  Logger.log(`🚀 Swagger is running on: ${await app.getUrl()}/docs`);
}

void bootstrap();
