import { ApiProperty } from '@nestjs/swagger';
import * as prisma from '@prisma/client';

export class Template implements prisma.Template {
  @ApiProperty({
    type: String,
  })
  id: string;

  @ApiProperty({
    type: String,
  })
  name: string;

  @ApiProperty({
    type: String,
  })
  template: string;

  @ApiProperty({
    type: String,
    format: 'date-time',
  })
  createdAt: Date;

  @ApiProperty({
    type: String,
  })
  createdByUserId: string;

  @ApiProperty({
    type: String,
    format: 'date-time',
  })
  updatedAt: Date;

  @ApiProperty({
    type: String,
  })
  updatedByUserId: string;

  @ApiProperty({
    type: String,
    format: 'date-time',
  })
  deletedAt: Date | null;

  @ApiProperty({
    type: String,
  })
  deletedByUserId: string | null;
}
