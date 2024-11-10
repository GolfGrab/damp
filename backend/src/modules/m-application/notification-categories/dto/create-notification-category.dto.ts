import { ApiProperty } from '@nestjs/swagger';

export class CreateNotificationCategoryDto {
  @ApiProperty({
    type: String,
  })
  name: string;
}
