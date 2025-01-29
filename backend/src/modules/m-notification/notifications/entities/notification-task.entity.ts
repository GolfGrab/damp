import { ApiProperty } from '@nestjs/swagger';
import * as prisma from '@prisma/client';

export class NotificationTask implements prisma.NotificationTask {
  @ApiProperty({
    type: Number,
  })
  id: number;

  @ApiProperty({
    type: String,
  })
  templateId: string;

  @ApiProperty({
    type: String,
    enum: prisma.Priority,
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
    enum: prisma.ChannelType,
  })
  channelType: prisma.ChannelType;

  @ApiProperty({
    type: String,
  })
  channelToken: string;

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
    enum: prisma.MessageType,
  })
  messageType: prisma.MessageType;

  @ApiProperty({
    type: String,
    enum: prisma.SentStatus,
  })
  sentStatus: prisma.SentStatus;

  @ApiProperty({
    type: String,
    format: 'date-time',
    nullable: true,
  })
  sentTimestamp: Date | null;

  @ApiProperty({
    type: String,
    format: 'date-time',
    nullable: true,
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
