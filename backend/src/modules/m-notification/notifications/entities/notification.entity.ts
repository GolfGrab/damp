import { ApiProperty } from '@nestjs/swagger';
import * as prisma from '@prisma/client';

export class Notification implements prisma.Notification {
  @ApiProperty({
    type: Number,
  })
  id: number;

  @ApiProperty({
    type: String,
  })
  applicationId: string;

  @ApiProperty({
    type: String,
  })
  notificationCategoryId: string;

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
