import { Injectable } from '@nestjs/common';
import { CreateTemplateDto } from './dto/create-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';
import { PrismaService } from 'nestjs-prisma';
import { $Enums } from '@prisma/client';

@Injectable()
export class TemplatesService {
  constructor(private readonly prisma: PrismaService) {}

  create(createTemplateDto: CreateTemplateDto) {
    return this.prisma.template.create({
      data: {
        ...createTemplateDto,
        compiledTemplates: {
          // TODO: KATID Separate this into a separate service with real logic
          createMany: {
            data: [
              {
                messageType: $Enums.MessageType.HTML,
                compiledTemplate:
                  'compiled-template HTML' + createTemplateDto.template,
              },
              {
                messageType: $Enums.MessageType.MARKDOWN,
                compiledTemplate:
                  'compiled-template MARKDOWN' + createTemplateDto.template,
              },
              {
                messageType: $Enums.MessageType.TEXT,
                compiledTemplate:
                  'compiled-template TEXT' + createTemplateDto.template,
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
    });
  }

  update(id: number, updateTemplateDto: UpdateTemplateDto) {
    return this.prisma.template.update({
      where: {
        id,
      },
      data: updateTemplateDto, // TODO: KATID Add compiledTemplates
    });
  }

  remove(id: number) {
    return this.prisma.template.delete({
      where: {
        id,
      },
    });
  }
}
