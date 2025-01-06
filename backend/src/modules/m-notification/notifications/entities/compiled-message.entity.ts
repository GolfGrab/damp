import { ApiProperty } from '@nestjs/swagger';
import * as prisma from '@prisma/client';

export class CompiledMessage implements prisma.CompiledMessage {
  @ApiProperty({
    type: String,
  })
  templateId: string;

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
  compiledMessage: string;
}
