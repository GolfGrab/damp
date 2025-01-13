import { ApiPropertyOptional } from '@nestjs/swagger';
import { Prisma } from '@prisma/client';
import { IsEnum, IsOptional } from 'class-validator';

export class NotificationTasksOrderDto {
  @IsEnum(Prisma.NotificationTaskScalarFieldEnum)
  @IsOptional()
  @ApiPropertyOptional({
    type: String,
    enum: Prisma.NotificationTaskScalarFieldEnum,
  })
  sortField?: Prisma.NotificationTaskScalarFieldEnum;

  @IsEnum(Prisma.SortOrder)
  @IsOptional()
  @ApiPropertyOptional({
    type: String,
    enum: Prisma.SortOrder,
  })
  sortOrder?: Prisma.SortOrder;
}
