import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export const generateSwaggerDoc = (app: INestApplication<any>) => {
  const config = new DocumentBuilder()
    .setTitle('DAMP Notification Infrastructure')
    .setDescription('API Documentation for DAMP Notification Infrastructure')
    .setVersion('0.0.1')
    .addBearerAuth(undefined, 'Api_Key')
    .addBearerAuth(undefined, 'Access_Token')
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
