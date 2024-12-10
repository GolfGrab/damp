import { Injectable } from '@nestjs/common';
import { $Enums, MessageType } from '@prisma/client';
import { PrismaService } from 'nestjs-prisma';
import { CreateTemplateDto } from './dto/create-template.dto';
import { GetPreviewTemplateDto } from './dto/get-preview-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';
import { TemplatesParserService } from './template-parser.service';
import { TemplatesRendererService } from './template-renderer.service';

@Injectable()
export class TemplatesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly templatesParserService: TemplatesParserService,
    private readonly templatesRendererService: TemplatesRendererService,
  ) {}

  create(createTemplateDto: CreateTemplateDto) {
    const compiledTemplates =
      this.templatesParserService.parseJSONToCompiledTemplates(
        createTemplateDto.template,
      );
    return this.prisma.template.create({
      data: {
        ...createTemplateDto,
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

  findAll() {
    return this.prisma.template.findMany();
  }

  findOne(id: number) {
    return this.prisma.template.findUniqueOrThrow({
      where: {
        id,
      },
      include: {
        compiledTemplates: true,
      },
    });
  }

  update(id: number, updateTemplateDto: UpdateTemplateDto) {
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

  remove(id: number) {
    return this.prisma.template.delete({
      where: {
        id,
      },
    });
  }

  async render(
    id: number,
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
