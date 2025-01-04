import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class VerifyUserDto {
  @IsString()
  @ApiProperty({
    type: String,
  })
  readonly otpCode: string;
}
