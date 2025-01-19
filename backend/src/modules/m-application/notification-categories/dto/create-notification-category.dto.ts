import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateNotificationCategoryDto {
  @IsString()
  @ApiProperty({
    type: String,
  })
  name: string;
}
