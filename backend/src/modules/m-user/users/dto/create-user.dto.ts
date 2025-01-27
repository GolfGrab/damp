import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @ApiProperty({
    type: String,
  })
  id: string;

  @IsEmail()
  @ApiProperty({
    type: String,
    format: 'email',
  })
  email: string;
}
