import { ApiProperty } from '@nestjs/swagger';
import * as prisma from '@prisma/client';

export class NotificationCategory implements prisma.NotificationCategory {
  @ApiProperty({
    type: String,
  })
  id: string;

  @ApiProperty({
    type: String,
  })
  applicationId: string;

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

  @ApiProperty({
    type: String,
    format: 'date-time',
    nullable: true,
  })
  deletedAt: Date | null;

  @ApiProperty({
    type: String,
    nullable: true,
  })
  deletedByUserId: string | null;
}
