import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class UpsertAccountDto {
  @IsString()
  @ApiProperty({
    type: String,
  })
  channelToken: string;
}
