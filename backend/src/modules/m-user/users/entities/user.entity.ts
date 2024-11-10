import { ApiProperty } from '@nestjs/swagger';
import * as prisma from '@prisma/client';

export class User implements prisma.User {
  @ApiProperty({
    type: String,
  })
  id: string;

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
