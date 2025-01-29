import { Config } from '@/utils/config/config-dto';
import { Test, TestingModule } from '@nestjs/testing';
import { User } from '@prisma/client';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { PrismaService } from 'nestjs-prisma';
import { CreateTemplateDto } from './dto/create-template.dto';
import { TemplatesParserService } from './template-parser.service';
import { TemplatesRendererService } from './template-renderer.service';
import { TemplatesService } from './templates.service';

describe('TemplatesService', () => {
  let service: TemplatesService;
  let prismaService: DeepMockProxy<PrismaService>;
  let templatesParserService: DeepMockProxy<TemplatesParserService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TemplatesService,
        { provide: PrismaService, useValue: mockDeep<PrismaService>() },
        { provide: Config, useValue: mockDeep<Config>() },
        {
          provide: TemplatesParserService,
          useValue: mockDeep<TemplatesParserService>(),
        },
        {
          provide: TemplatesRendererService,
          useValue: mockDeep<TemplatesRendererService>(),
        },
      ],
    }).compile();

    service = module.get(TemplatesService);
    prismaService = module.get(PrismaService);
    templatesParserService = module.get(TemplatesParserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new template', async () => {
      const createTemplateDto: CreateTemplateDto = {
        name: 'Test Template',
        template: { type: 'doc', content: [] },
      };
      const user: User = { id: 'user1' } as User;
      templatesParserService.parseJSONToCompiledTemplates.mockReturnValue({
        HTML: '<p></p>',
        MARKDOWN: '',
        TEXT: '',
      });
      prismaService.template.create.mockResolvedValue({
        id: 'test-template',
        name: 'Test Template',
        template: JSON.stringify(createTemplateDto.template),
        createdAt: new Date(),
        updatedAt: new Date(),
        createdByUserId: 'user1',
        updatedByUserId: 'user1',
        deletedAt: null,
        deletedByUserId: null,
      });

      const result = await service.create(createTemplateDto, user);
      expect(result.id).toBe('test-template');
    });
  });

  describe('findOne', () => {
    it('should find one template by ID', async () => {
      prismaService.template.findUniqueOrThrow.mockResolvedValue({
        id: 'test-template',
        createdAt: new Date(),
        updatedAt: new Date(),
        createdByUserId: 'user1',
        updatedByUserId: 'user1',
        deletedAt: null,
        deletedByUserId: null,
        name: 'Test Template',
        template: JSON.stringify({ type: 'doc', content: [] }),
      });
      const result = await service.findOne('test-template');
      expect(result.id).toBe('test-template');
    });
  });

  describe('delete', () => {
    it('should soft delete a template', async () => {
      const user: User = { id: 'user1' } as User;
      prismaService.template.update.mockResolvedValue({
        id: 'test-template',
        createdAt: new Date(),
        updatedAt: new Date(),
        createdByUserId: 'user1',
        updatedByUserId: 'user1',
        deletedAt: null,
        deletedByUserId: null,
        name: 'Test Template',
        template: JSON.stringify({ type: 'doc', content: [] }),
      });
      const result = await service.delete('test-template', user);
      expect(result.deletedAt).toBeDefined();
    });
  });
});
