import { Config } from '@/utils/config/config-dto';
import { paginate } from '@/utils/paginator/pagination.function';
import { PaginationQueryDto } from '@/utils/paginator/paginationQuery.dto';
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'nestjs-prisma';
import { CreateManyUsersDto } from './dto/create-many-users.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersOrderDto } from './dto/users-order.dto';
import { UsersSearchDto } from './dto/users-search.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: Config,
  ) {}

  create(createUserDto: CreateUserDto) {
    return this.prisma.user.create({
      data: createUserDto,
    });
  }

  async upsertMany(createManyUsersDto: CreateManyUsersDto, user: User) {
    const BATCH_SIZE = 10;
    const users = createManyUsersDto.users;

    for (let i = 0; i < users.length; i += BATCH_SIZE) {
      const batch = users.slice(i, i + BATCH_SIZE);
      await Promise.all(
        batch.map(async (upsertUser) => {
          await this.prisma.user.upsert({
            where: {
              id: upsertUser.id,
            },
            create: {
              ...upsertUser,
              createdByUserId: user.id,
              updatedByUserId: user.id,
            },
            update: {
              ...upsertUser,
              updatedByUserId: user.id,
            },
          });
        }),
      );
    }
  }

  findAll(
    paginationQueryDto: PaginationQueryDto,
    usersOrderDto: UsersOrderDto,
    usersSearchDto: UsersSearchDto,
  ) {
    return paginate<User, Prisma.UserFindManyArgs>({
      prismaQueryModel: this.prisma.user,
      paginateOptions: paginationQueryDto,
      findManyArgs: {
        where: {
          id: {
            not: this.config.SYSTEM_USER_ID,
          },
          OR: [
            {
              id: {
                contains: usersSearchDto.search,
                mode: 'insensitive',
              },
            },
            {
              email: {
                contains: usersSearchDto.search,
                mode: 'insensitive',
              },
            },
            {
              createdByUserId: {
                contains: usersSearchDto.search,
                mode: 'insensitive',
              },
            },
            {
              updatedByUserId: {
                contains: usersSearchDto.search,
                mode: 'insensitive',
              },
            },
          ],
        },
        orderBy: {
          ...(usersOrderDto.sortField && usersOrderDto.sortOrder
            ? {
                [usersOrderDto.sortField]: usersOrderDto.sortOrder,
              }
            : {}),
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
