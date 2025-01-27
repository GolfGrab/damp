import { ApiProperty } from '@nestjs/swagger';
import * as prisma from '@prisma/client';

export class User implements prisma.User {
  @ApiProperty({
    type: String,
  })
  id: string;

  @ApiProperty({
    type: String,
    format: 'email',
  })
  email: string;

  @ApiProperty({
    type: String,
    format: 'date-time',
  })
  createdAt: Date;

  @ApiProperty({
    type: String,
    nullable: true,
  })
  createdByUserId: string | null;

  @ApiProperty({
    type: String,
    format: 'date-time',
  })
  updatedAt: Date;

  @ApiProperty({
    type: String,
    nullable: true,
  })
  updatedByUserId: string | null;
}
