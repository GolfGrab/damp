import { Module } from '@nestjs/common';
import { TemplatesParserService } from './template-parser.service';
import { TemplatesRendererService } from './template-renderer.service';
import { TemplatesService } from './templates.service';

@Module({
  providers: [
    TemplatesService,
    TemplatesParserService,
    TemplatesRendererService,
  ],
  exports: [TemplatesService],
})
export class TemplatesModule {}
