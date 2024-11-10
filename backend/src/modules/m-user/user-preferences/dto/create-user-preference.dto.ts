import { ApiProperty } from '@nestjs/swagger';

export class CreateUserPreferenceDto {
  @ApiProperty({
    type: Boolean,
  })
  isPreferred: boolean;
}
