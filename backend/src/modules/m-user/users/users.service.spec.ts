/* eslint-disable @typescript-eslint/unbound-method */
import { Config } from '@/utils/config/config-dto';
import { PaginationQueryDto } from '@/utils/paginator/paginationQuery.dto';
import { Test, TestingModule } from '@nestjs/testing';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { PrismaService } from 'nestjs-prisma';
import { CreateManyUsersDto } from './dto/create-many-users.dto';
import { UsersOrderDto } from './dto/users-order.dto';
import { UsersSearchDto } from './dto/users-search.dto';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;
  let prismaService: DeepMockProxy<PrismaService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: mockDeep<PrismaService>() },
        {
          provide: Config,
          useValue: mockDeep<Config>({ SYSTEM_USER_ID: 'systemUser' }),
        },
      ],
    }).compile();

    service = module.get(UsersService);
    prismaService = module.get(PrismaService);
  });

  describe('upsertMany', () => {
    it('should upsert multiple users in batches', async () => {
      const user: User = { id: 'adminUser' } as User;
      const createManyUsersDto: CreateManyUsersDto = {
        users: [
          { id: 'user1', email: 'user1@example.com' },
          { id: 'user2', email: 'user2@example.com' },
        ],
      };

      prismaService.user.upsert
        .mockResolvedValueOnce({
          id: 'user1',
          email: 'user1@example.com',
          createdByUserId: 'adminUser',
          updatedByUserId: 'adminUser',
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .mockResolvedValueOnce({
          id: 'user2',
          email: 'user2@example.com',
          createdByUserId: 'adminUser',
          updatedByUserId: 'adminUser',
          createdAt: new Date(),
          updatedAt: new Date(),
        });

      await service.upsertMany(createManyUsersDto, user);

      expect(prismaService.user.upsert).toHaveBeenCalledTimes(2);
    });
  });

  describe('findAll', () => {
    it('should return paginated users excluding system user', async () => {
      const paginationQueryDto: PaginationQueryDto = { page: 1, perPage: 10 };
      const usersOrderDto: UsersOrderDto = {
        sortField: 'id',
        sortOrder: 'asc',
      };
      const usersSearchDto: UsersSearchDto = { search: 'user' };

      const mockUsers = [
        {
          id: 'user123',
          email: 'user@example.com',
          createdAt: new Date(),
          updatedAt: new Date(),
          createdByUserId: null,
          updatedByUserId: null,
        },
      ];
      prismaService.user.findMany.mockResolvedValue(mockUsers);
      prismaService.user.count.mockResolvedValue(mockUsers.length);

      const result = await service.findAll(
        paginationQueryDto,
        usersOrderDto,
        usersSearchDto,
      );

      expect(result.data).toEqual(mockUsers);
      expect(prismaService.user.findMany).toHaveBeenCalledTimes(1);
    });
  });
});
