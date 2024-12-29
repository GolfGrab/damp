import { ApiProperty } from '@nestjs/swagger';
import * as prisma from '@prisma/client';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsString,
} from 'class-validator';

export class CreateNotificationDto {
  @IsString()
  @ApiProperty({
    type: String,
  })
  templateId: string;

  @ApiProperty({
    type: Object,
  })
  @IsObject()
  @IsNotEmpty()
  templateData: Record<string, any>;

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
