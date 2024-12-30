import { $Enums, NotificationTask } from '@prisma/client';
import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class NotificationTaskMessageDto implements NotificationTask {
  @IsEnum($Enums.ChannelType)
  channelType: $Enums.ChannelType;

  @IsString()
  userId: string;

  @IsNumber()
  notificationId: number;

  @IsString()
  templateId: string;

  @IsEnum($Enums.MessageType)
  messageType: $Enums.MessageType;

  @IsEnum($Enums.Priority)
  priority: $Enums.Priority;

  @IsEnum($Enums.SentStatus)
  sentStatus: $Enums.SentStatus;

  @IsDateString()
  @IsOptional()
  sentTimestamp: Date | null;

  @IsDateString()
  @IsOptional()
  failedTimestamp: Date | null;

  @IsNumber()
  retryCount: number;

  @IsNumber()
  retryLimit: number;

  @IsDateString()
  createdAt: Date;

  @IsDateString()
  updatedAt: Date;
}
