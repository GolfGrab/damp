import { Injectable } from '@nestjs/common';
import { Liquid } from 'liquidjs';

@Injectable()
export class TemplatesRendererService {
  private readonly engine: Liquid;

  constructor() {
    this.engine = new Liquid();
  }

  render(template: string, data: Record<string, any>): Promise<string> {
    return this.engine.parseAndRender(template, data);
  }
}
