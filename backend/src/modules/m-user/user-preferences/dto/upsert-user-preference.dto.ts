import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class UpsertUserPreferenceDto {
  @IsBoolean()
  @ApiProperty({
    type: Boolean,
  })
  isPreferred: boolean;
}
