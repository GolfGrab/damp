import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateAccountDto {
  @IsString()
  @ApiProperty({
    type: String,
  })
  channelToken: string;
}
