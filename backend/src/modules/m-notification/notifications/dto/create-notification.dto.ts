import { ApiProperty } from '@nestjs/swagger';
import * as prisma from '@prisma/client';

export class CreateNotificationDto {
  @ApiProperty({
    type: Number,
  })
  templateId: number;

  @ApiProperty({
    type: String,
  })
  templateData: string;

  @ApiProperty({
    type: Number,
  })
  notificationCategoryId: number;

  @ApiProperty({
    type: String,
  })
  priority: prisma.$Enums.Priority;
}
