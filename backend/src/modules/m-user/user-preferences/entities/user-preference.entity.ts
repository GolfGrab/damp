import { ApiProperty } from '@nestjs/swagger';
import * as prisma from '@prisma/client';

export class UserPreference implements prisma.UserPreference {
  @ApiProperty({
    type: String,
  })
  userId: string;

  @ApiProperty({
    type: String,
  })
  notificationCategoryId: string;

  @ApiProperty({
    type: String,
    enum: prisma.$Enums.ChannelType,
  })
  channelType: prisma.$Enums.ChannelType;

  @ApiProperty({
    type: Boolean,
  })
  isPreferred: boolean;

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
