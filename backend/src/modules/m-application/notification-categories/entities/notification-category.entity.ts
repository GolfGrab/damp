import { ApiProperty } from '@nestjs/swagger';
import * as prisma from '@prisma/client';

export class NotificationCategory implements prisma.NotificationCategory {
  @ApiProperty({
    type: Number,
  })
  id: number;

  @ApiProperty({
    type: Number,
  })
  applicationId: number;

  @ApiProperty({
    type: String,
  })
  name: string;

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
