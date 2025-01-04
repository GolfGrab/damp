import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { User } from '@prisma/client';
import { Auth, GetUser } from './auth.decorator';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  @Get('me')
  @Auth()
  me(@GetUser() user: User) {
    return user;
  }
}
