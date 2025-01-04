/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { PrismaService } from 'nestjs-prisma';
import { TemplatesParserService } from './template-parser.service';
import { TemplatesRendererService } from './template-renderer.service';
import { TemplatesService } from './templates.service';

describe('TemplatesService', () => {
  let service: TemplatesService;
  let prismaService: DeepMockProxy<PrismaService>;
  let templatesParserService: DeepMockProxy<TemplatesParserService>;
  let templatesRendererService: DeepMockProxy<TemplatesRendererService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TemplatesService,
        { provide: PrismaService, useValue: mockDeep<PrismaService>() },
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
    templatesRendererService = module.get(TemplatesRendererService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
