import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UsersSearchDto {
  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    type: String,
  })
  search?: string;
}
