import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateTemplateDto {
  @IsString()
  @ApiProperty({
    type: String,
  })
  name: string;

  @IsString()
  @ApiProperty({
    type: String,
  })
  description: string;

  @IsString()
  @ApiProperty({
    type: String,
  })
  template: string;
}
