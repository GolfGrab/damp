import { Injectable } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  create(createUserDto: CreateUserDto) {
    return this.prisma.user.create({
      data: {
        id: createUserDto.id,
        email: createUserDto.email,
      },
    });
  }

  findAll() {
    return this.prisma.user.findMany();
  }

  findOne(userId: string) {
    return this.prisma.user.findFirstOrThrow({
      where: {
        id: userId,
      },
    });
  }
}
