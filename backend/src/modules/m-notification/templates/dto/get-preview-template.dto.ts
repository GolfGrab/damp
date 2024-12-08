import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsObject, IsOptional } from 'class-validator';

export class GetPreviewTemplateDto {
  @ApiProperty()
  @IsOptional()
  @IsObject()
  @IsNotEmpty()
  data: Record<string, any>;
}
