import { ApiProperty } from '@nestjs/swagger';
import { IsArray, ValidateNested } from 'class-validator';
import { CreateUserDto } from './create-user.dto';
import { Type } from 'class-transformer';

export class CreateManyUsersDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateUserDto)
  @ApiProperty({
    type: CreateUserDto,
    isArray: true,
  })
  users: CreateUserDto[];
}
