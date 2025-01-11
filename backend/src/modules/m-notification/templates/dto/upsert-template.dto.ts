import { ApiProperty } from '@nestjs/swagger';
import { JSONContent } from '@tiptap/core';
import { IsObject, IsString } from 'class-validator';

export class UpsertTemplateDto {
  @IsString()
  @ApiProperty({
    type: String,
  })
  id: string;

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

  @IsString()
  @ApiProperty({
    type: String,
  })
  createdByUserId: string; // TODO: Use the current user ID

  @IsString()
  @ApiProperty({
    type: String,
  })
  updatedByUserId: string; // TODO: Use the current user ID
}
