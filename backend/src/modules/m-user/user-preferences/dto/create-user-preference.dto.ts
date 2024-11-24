import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class CreateUserPreferenceDto {
  @IsBoolean()
  @ApiProperty({
    type: Boolean,
  })
  isPreferred: boolean;
}
