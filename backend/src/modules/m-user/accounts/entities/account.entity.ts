import { ApiProperty } from '@nestjs/swagger';
import * as prisma from '@prisma/client';
export class Account implements prisma.Account {
  @ApiProperty({
    type: String,
  })
  userId: string;

  @ApiProperty({
    type: String,
    enum: prisma.$Enums.ChannelType,
  })
  channelType: prisma.$Enums.ChannelType;

  @ApiProperty({
    type: String,
  })
  channelToken: string;

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
