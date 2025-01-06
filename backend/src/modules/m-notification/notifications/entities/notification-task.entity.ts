import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import * as prisma from '@prisma/client';

export class NotificationTask implements prisma.NotificationTask {
  @ApiProperty({
    type: String,
  })
  templateId: string;

  @ApiProperty({
    type: String,
  })
  priority: prisma.Priority;

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

  @ApiProperty({
    type: String,
  })
  channelType: prisma.ChannelType;

  @ApiProperty({
    type: String,
  })
  userId: string;

  @ApiProperty({
    type: Number,
  })
  notificationId: number;

  @ApiProperty({
    type: String,
  })
  messageType: prisma.MessageType;

  @ApiProperty({
    type: String,
  })
  sentStatus: prisma.SentStatus;

  @ApiPropertyOptional({
    type: String,
    format: 'date-time',
  })
  sentTimestamp: Date | null;

  @ApiPropertyOptional({
    type: String,
    format: 'date-time',
  })
  failedTimestamp: Date | null;

  @ApiProperty({
    type: Number,
  })
  retryCount: number;

  @ApiProperty({
    type: Number,
  })
  retryLimit: number;
}
