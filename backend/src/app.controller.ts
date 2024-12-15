import { Controller, Get, Header } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('Main Module')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('docs-stop-light')
  @Header('Content-Type', 'text/html')
  getSwaggerStopLight(): string {
    return this.appService.getSwaggerStopLight();
  }
}
