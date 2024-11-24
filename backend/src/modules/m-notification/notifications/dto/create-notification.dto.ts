import { ApiProperty } from '@nestjs/swagger';
import * as prisma from '@prisma/client';
import { IsEnum, IsNumber, IsString } from 'class-validator';

export class CreateNotificationDto {
  @IsNumber()
  @ApiProperty({
    type: Number,
  })
  templateId: number;

  @IsString()
  @ApiProperty({
    type: String,
  })
  templateData: string;

  @IsNumber()
  @ApiProperty({
    type: Number,
  })
  notificationCategoryId: number;

  @IsEnum(prisma.$Enums.Priority)
  @ApiProperty({
    type: String,
    enum: prisma.$Enums.Priority,
  })
  priority: prisma.$Enums.Priority;

  @IsString({ each: true })
  @ApiProperty({
    type: String,
    isArray: true,
  })
  recipientIds: string[];
}
