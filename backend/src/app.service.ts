import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as Prisma from '@prisma/client';
import { PrismaService } from 'nestjs-prisma';
import { TemplatesService } from './modules/m-notification/templates/templates.service';

@Injectable()
export class AppService implements OnModuleInit {
  constructor(
    private readonly prisma: PrismaService,
    private readonly templatesService: TemplatesService,
  ) {}

  async onModuleInit() {
    await this.setup();
  }

  private readonly logger = new Logger(AppService.name);

  async setup(): Promise<void> {
    this.logger.log('Setting up system data');

    // upsert channel types
    this.logger.log('Upserting channel types');
    const channelTypeMessageTypeMap = {
      [Prisma.ChannelType.EMAIL]: Prisma.MessageType.HTML,
      [Prisma.ChannelType.SMS]: Prisma.MessageType.TEXT,
      [Prisma.ChannelType.SLACK]: Prisma.MessageType.MARKDOWN,
    } as const;

    await Promise.all(
      Object.entries(channelTypeMessageTypeMap).map(
        async ([channelType, messageType]) => {
          await this.prisma.channel.upsert({
            where: {
              channelType: channelType as Prisma.ChannelType,
            },
            create: {
              channelType: channelType as Prisma.ChannelType,
              messageType: messageType as Prisma.MessageType,
            },
            update: {
              messageType: messageType as Prisma.MessageType,
            },
          });
        },
      ),
    );

    // upsert system user
    this.logger.log('Upserting system user');
    await this.prisma.user.upsert({
      where: {
        id: 'System-user',
      },
      create: {
        id: 'System-user',
      },
      update: {},
    });

    // upsert system application
    this.logger.log('Upserting system application');
    await this.prisma.application.upsert({
      where: {
        id: 'System-application',
      },
      create: {
        id: 'System-application',
        name: 'System-application',
        description: 'System application',
        apiKey: 'System-apiKey',
        createdByUserId: 'System-user',
        updatedByUserId: 'System-user',
      },
      update: {},
    });

    // upsert system notification category for OTP ( One category per channel type )
    this.logger.log('Upserting system notification categories for OTP');
    await Promise.all(
      Object.keys(channelTypeMessageTypeMap).map(async (channelType) => {
        await this.prisma.notificationCategory.upsert({
          where: {
            id: `System_${channelType}_OTP`,
          },
          create: {
            id: `System_${channelType}_OTP`,
            name:
              'System OTP Verification Notification Category for ' +
              channelType,
            applicationId: 'System-application',
            createdByUserId: 'System-user',
            updatedByUserId: 'System-user',
          },
          update: {},
        });
      }),
    );

    // upsert system templates for OTP ( One template per channel type )
    this.logger.log('Upserting system templates for OTP');
    await Promise.all(
      Object.keys(channelTypeMessageTypeMap).map(async (channelType) => {
        const template = {
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: `OTP Verification for ${channelType} channel`,
                },
              ],
            },
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: `Your OTP for verify ${channelType} channel is: {{otpCode}}`,
                },
              ],
            },
          ],
        };

        await this.templatesService.upsert({
          id: `System_${channelType}_OTP`,
          name:
            '[Do not edit] System OTP Verification Template for ' + channelType,
          template: template,
          createdByUserId: 'System-user',
          updatedByUserId: 'System-user',
        });
      }),
    );
  }

  getHello() {
    return 'Hello World!';
  }

  getSwaggerStoplight(): string {
    return `
    <!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <title>Elements in HTML</title>
    <!-- Embed elements Elements via Web Component -->
    <script src="https://unpkg.com/@stoplight/elements/web-components.min.js"></script>
    <link rel="stylesheet" href="https://unpkg.com/@stoplight/elements/styles.min.css">
  </head>
  <body>

    <elements-api
      apiDescriptionUrl="/docs-json"
      router="hash"
      layout="sidebar"
    />

  </body>
</html>
    `;
  }
}
