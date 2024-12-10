import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsObject } from 'class-validator';

export class GetPreviewTemplateDto {
  @ApiProperty({
    type: Object,
  })
  @IsObject()
  @IsNotEmpty()
  data: Record<string, any>;
}
