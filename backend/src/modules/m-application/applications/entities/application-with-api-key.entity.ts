import { ApiProperty } from '@nestjs/swagger';
import * as prisma from '@prisma/client';

export class ApplicationWithApiKey implements prisma.Application {
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
  description: string;

  @ApiProperty({
    type: String,
  })
  apiKey: string;

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
}
