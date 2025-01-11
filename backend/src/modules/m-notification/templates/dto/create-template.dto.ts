import { ApiProperty } from '@nestjs/swagger';
import { JSONContent } from '@tiptap/core';
import { IsObject, IsString } from 'class-validator';

export class CreateTemplateDto {
  @IsString()
  @ApiProperty({
    type: String,
  })
  name: string;

  @IsObject()
  @ApiProperty({
    type: Object,
  })
  template: JSONContent;
}
