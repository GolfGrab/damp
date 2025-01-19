import { paginate } from '@/utils/paginator/pagination.function';
import { PaginationQueryDto } from '@/utils/paginator/paginationQuery.dto';
import { Injectable } from '@nestjs/common';
import { $Enums, MessageType, Prisma, User } from '@prisma/client';
import * as _ from 'lodash';
import { PrismaService } from 'nestjs-prisma';
import { CreateTemplateDto } from './dto/create-template.dto';
import { GetPreviewTemplateDto } from './dto/get-preview-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';
import { UpsertTemplateDto } from './dto/upsert-template.dto';
import { Template } from './entities/template.entity';
import { TemplatesParserService } from './template-parser.service';
import { TemplatesRendererService } from './template-renderer.service';

@Injectable()
export class TemplatesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly templatesParserService: TemplatesParserService,
    private readonly templatesRendererService: TemplatesRendererService,
  ) {}

  upsert(upsertTemplateDto: UpsertTemplateDto) {
    const compiledTemplates =
      this.templatesParserService.parseJSONToCompiledTemplates(
        upsertTemplateDto.template,
      );
    return this.prisma.template.upsert({
      where: {
        id: upsertTemplateDto.id,
      },
      create: {
        ...upsertTemplateDto,
        template: JSON.stringify(upsertTemplateDto.template),
        compiledTemplates: {
          createMany: {
            data: Object.values($Enums.MessageType).map((messageType) => ({
              messageType,
              compiledTemplate: compiledTemplates[messageType],
            })),
          },
        },
      },
      update: {
        ...upsertTemplateDto,
        template: JSON.stringify(upsertTemplateDto.template),
        compiledTemplates: {
          upsert: Object.values($Enums.MessageType).map((messageType) => ({
            where: {
              templateId_messageType: {
                messageType,
                templateId: upsertTemplateDto.id,
              },
            },
            create: {
              messageType,
              compiledTemplate: compiledTemplates[messageType],
            },
            update: {
              compiledTemplate: compiledTemplates[messageType],
            },
          })),
        },
      },
    });
  }

  create(createTemplateDto: CreateTemplateDto, user: User) {
    const compiledTemplates =
      this.templatesParserService.parseJSONToCompiledTemplates(
        createTemplateDto.template,
      );
    const templateName =
      _.kebabCase(createTemplateDto.name) + '-' + new Date().getTime();
    return this.prisma.template.create({
      data: {
        ...createTemplateDto,
        id: templateName,
        createdByUserId: user.id,
        updatedByUserId: user.id,
        template: JSON.stringify(createTemplateDto.template),
        compiledTemplates: {
          createMany: {
            data: [
              {
                messageType: $Enums.MessageType.HTML,
                compiledTemplate: compiledTemplates.HTML,
              },
              {
                messageType: $Enums.MessageType.MARKDOWN,
                compiledTemplate: compiledTemplates.MARKDOWN,
              },
              {
                messageType: $Enums.MessageType.TEXT,
                compiledTemplate: compiledTemplates.TEXT,
              },
            ],
          },
        },
      },
    });
  }

  findPaginated(
    search: {
      templateName?: string;
    },
    paginateQuery: PaginationQueryDto,
  ) {
    return paginate<Template, Prisma.TemplateFindManyArgs>({
      prismaQueryModel: this.prisma.template,
      findManyArgs: {
        where: {
          name: {
            contains: search.templateName,
            mode: 'insensitive',
          },
          deletedAt: null,
          // Todo filter system templates
        },
      },
      paginateOptions: paginateQuery,
    });
  }

  findOne(id: string) {
    return this.prisma.template.findUniqueOrThrow({
      where: {
        id,
      },
      include: {
        compiledTemplates: true,
      },
    });
  }

  update(id: string, updateTemplateDto: UpdateTemplateDto, user: User) {
    const compiledTemplates = updateTemplateDto.template
      ? this.templatesParserService.parseJSONToCompiledTemplates(
          updateTemplateDto.template,
        )
      : undefined;
    return this.prisma.template.update({
      where: {
        id,
      },
      data: {
        name: updateTemplateDto.name,
        updatedByUserId: user.id,
        template: JSON.stringify(updateTemplateDto.template),
        compiledTemplates: {
          update: [
            {
              where: {
                templateId_messageType: {
                  messageType: $Enums.MessageType.HTML,
                  templateId: id,
                },
              },
              data: {
                compiledTemplate: compiledTemplates?.HTML,
              },
            },
            {
              where: {
                templateId_messageType: {
                  messageType: $Enums.MessageType.MARKDOWN,
                  templateId: id,
                },
              },
              data: {
                compiledTemplate: compiledTemplates?.MARKDOWN,
              },
            },
            {
              where: {
                templateId_messageType: {
                  messageType: $Enums.MessageType.TEXT,
                  templateId: id,
                },
              },
              data: {
                compiledTemplate: compiledTemplates?.TEXT,
              },
            },
          ],
        },
      },
    });
  }

  delete(id: string, user: User) {
    return this.prisma.template.update({
      where: {
        id,
      },
      data: {
        deletedAt: new Date(),
        deletedByUserId: user.id,
      },
    });
  }

  async render(
    id: string,
    messageType: MessageType,
    getPreviewTemplateDto: GetPreviewTemplateDto,
  ) {
    const compiledTemplate =
      await this.prisma.compiledTemplate.findUniqueOrThrow({
        where: {
          templateId_messageType: {
            messageType,
            templateId: id,
          },
        },
      });
    return this.templatesRendererService.render(
      compiledTemplate.compiledTemplate,
      getPreviewTemplateDto.data,
    );
  }
}
