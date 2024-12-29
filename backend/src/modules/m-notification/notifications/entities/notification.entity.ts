import { ApiProperty } from '@nestjs/swagger';
import * as prisma from '@prisma/client';

export class Notification implements prisma.Notification {
  @ApiProperty({
    type: Number,
  })
  id: number;

  @ApiProperty({
    type: Number,
  })
  applicationId: number;

  @ApiProperty({
    type: Number,
  })
  notificationCategoryId: number;

  @ApiProperty({
    type: String,
  })
  templateId: string;

  @ApiProperty({
    type: String,
  })
  templateData: string;

  @ApiProperty({
    type: String,
  })
  priority: prisma.$Enums.Priority;

  @ApiProperty({
    type: String,
    format: 'date-time',
  })
  createdAt: Date;

  @ApiProperty({
    type: String,
    format: 'date-time',
  })
  updatedAt: Date;
}
