import { ApiPropertyOptional } from '@nestjs/swagger';
import { Prisma } from '@prisma/client';
import { IsEnum, IsOptional } from 'class-validator';

export class UsersOrderDto {
  @IsEnum(Prisma.UserScalarFieldEnum)
  @IsOptional()
  @ApiPropertyOptional({
    type: String,
    enum: Prisma.UserScalarFieldEnum,
  })
  sortField?: Prisma.UserScalarFieldEnum;

  @IsEnum(Prisma.SortOrder)
  @IsOptional()
  @ApiPropertyOptional({
    type: String,
    enum: Prisma.SortOrder,
  })
  sortOrder?: Prisma.SortOrder;
}
