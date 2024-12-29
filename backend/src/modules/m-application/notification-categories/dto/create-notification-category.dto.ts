import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateNotificationCategoryDto {
  @IsString()
  @ApiProperty({
    type: String,
  })
  id: string;

  @IsString()
  @ApiProperty({
    type: String,
  })
  name: string;

  @IsString()
  @ApiProperty({
    type: String,
  })
  createdByUserId: string; // TODO: Use the current user ID

  @IsString()
  @ApiProperty({
    type: String,
  })
  updatedByUserId: string; // TODO: Use the current user ID
}
