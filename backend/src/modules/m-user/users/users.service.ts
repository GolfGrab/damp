import { Config } from '@/utils/config/config-dto';
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: Config,
  ) {}

  create(createUserDto: CreateUserDto) {
    return this.prisma.user.create({
      data: {
        id: createUserDto.id,
        email: createUserDto.email,
      },
    });
  }

  findAll() {
    return this.prisma.user.findMany({
      where: {
        id: {
          not: this.config.SYSTEM_USER_ID,
        },
      },
    });
  }

  findOne(userId: string) {
    return this.prisma.user.findFirstOrThrow({
      where: {
        AND: [
          {
            id: userId,
          },
          {
            id: {
              not: this.config.SYSTEM_USER_ID,
            },
          },
        ],
      },
    });
  }
}
