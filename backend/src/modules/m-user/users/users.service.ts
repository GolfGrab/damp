import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'nestjs-prisma';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  create(createUserDto: CreateUserDto) {
    return this.prisma.user.create({
      data: {
        id: createUserDto.id,
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

  update(userId: string, updateUserDto: UpdateUserDto) {
    return this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        id: updateUserDto.id,
      },
    });
  }

  remove(userId: string) {
    return this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        deletedAt: new Date(),
        deletedByUserId: 'user-id-1', // TODO: Use the current user ID
      },
    });
  }
}
