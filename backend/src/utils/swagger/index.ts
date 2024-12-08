import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export const generateSwaggerDoc = (app: INestApplication<any>) => {
  const config = new DocumentBuilder()
    .setTitle('NestJS Prisma Example')
    .setDescription('The NestJS Prisma Example API description')
    .setVersion('0.0.1')
    .addBearerAuth(undefined, 'Api Key')
    .addBearerAuth(undefined, 'Access Token')
    .build();

  const doc = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('/docs', app, doc, {
    jsonDocumentUrl: '/docs-json',
    yamlDocumentUrl: '/docs-yaml',
    swaggerOptions: {
      persistAuthorization: true,
    },
  });
};
