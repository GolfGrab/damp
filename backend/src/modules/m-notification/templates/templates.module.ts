import { Module } from '@nestjs/common';
import { TemplatesService } from './templates.service';
import { TemplatesParserService } from './template-parser.service';

@Module({
  providers: [TemplatesService, TemplatesParserService],
  exports: [TemplatesService, TemplatesParserService],
})
export class TemplatesModule {}
