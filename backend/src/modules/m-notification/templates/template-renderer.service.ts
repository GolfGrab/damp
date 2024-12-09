import { Injectable, Logger } from '@nestjs/common';
import { Liquid } from 'liquidjs';

@Injectable()
export class TemplatesRendererService {
  private readonly engine: Liquid = new Liquid();

  private readonly logger = new Logger(TemplatesRendererService.name);

  render(template: string, data: Record<string, any>): Promise<string> {
    return this.engine.parseAndRender(template, data);
  }
}
