/* eslint-disable @typescript-eslint/unbound-method */
import { Role } from '@/auth/auth-roles.decorator';
import { UserWithRoles } from '@/auth/UserWithRoles';
import { Config } from '@/utils/config/config-dto';
import { Test, TestingModule } from '@nestjs/testing';
import { Application } from '@prisma/client';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import * as lodash from 'lodash';
import { PrismaService } from 'nestjs-prisma';
import { ApplicationsService } from './applications.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';
import { ApplicationWithApiKey } from './entities/application-with-api-key';

describe('ApplicationsService', () => {
  let service: ApplicationsService;
  let prismaService: DeepMockProxy<PrismaService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicationsService,
        { provide: PrismaService, useValue: mockDeep<PrismaService>() },
        { provide: Config, useValue: mockDeep<Config>() },
      ],
    }).compile();

    service = module.get(ApplicationsService);
    prismaService = module.get(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create an application with a random API key', async () => {
      const createApplicationDto: CreateApplicationDto = {
        name: 'Test App',
        description: 'Test Description',
      };

      const mockApiKey = '1234-5678-9012-3456-7890';
      const mockCreatedApplication: ApplicationWithApiKey = {
        ...createApplicationDto,
        id: 'app123',
        createdByUserId: 'user123',
        updatedByUserId: 'user123',
        apiKey: mockApiKey,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const user: UserWithRoles = {
        id: 'user123',
        roles: [],
        email: '',
        createdAt: new Date(),
        updatedAt: new Date(),
        createdByUserId: null,
        updatedByUserId: null,
      };

      // Mocking external utilities
      jest.spyOn(global.crypto, 'randomUUID').mockReturnValue(mockApiKey);
      jest.spyOn(lodash, 'kebabCase').mockReturnValue('test-app');

      prismaService.application.create.mockResolvedValueOnce(
        mockCreatedApplication,
      );

      await expect(service.create(createApplicationDto, user)).resolves.toEqual(
        mockCreatedApplication,
      );

      const calledData = prismaService.application.create.mock.calls[0]?.[0];

      expect({
        ...calledData,
        data: {
          ...calledData?.data,
          id: mockCreatedApplication.id,
        },
      }).toEqual({
        data: {
          name: 'Test App',
          description: 'Test Description',
          createdByUserId: 'user123',
          updatedByUserId: 'user123',
          id: mockCreatedApplication.id,
          apiKey: mockApiKey,
        },
        select: service.selectAllFieldsIncludingApiKey,
      });
    });
  });
  describe('findAll', () => {
    it('should return all applications', async () => {
      const user: UserWithRoles = {
        id: 'user123',
        roles: [Role.Admin],
        email: '',
        createdAt: new Date(),
        updatedAt: new Date(),
        createdByUserId: null,
        updatedByUserId: null,
      };

      const mockApplications: Application[] = [
        {
          id: 'app1',
          name: 'App1',
          description: 'Description1',
          createdAt: new Date(),
          createdByUserId: 'user1',
          updatedAt: new Date(),
          updatedByUserId: 'user1',
          apiKey: 'key1',
        },
        {
          id: 'app2',
          name: 'App2',
          description: 'Description2',
          createdAt: new Date(),
          createdByUserId: 'user2',
          updatedAt: new Date(),
          updatedByUserId: 'user2',
          apiKey: 'key2',
        },
      ];

      prismaService.application.findMany.mockResolvedValueOnce(
        mockApplications,
      );

      await expect(service.findAll(user)).resolves.toEqual(mockApplications);
      expect(prismaService.application.findMany).toHaveBeenCalledTimes(1);
    });
  });

  describe('findOne', () => {
    it('should return a single application by ID', async () => {
      const mockApplication: Application = {
        id: 'app1',
        name: 'App1',
        description: 'Description1',
        createdAt: new Date(),
        createdByUserId: 'user1',
        updatedAt: new Date(),
        updatedByUserId: 'user1',
        apiKey: 'key1',
      };

      prismaService.application.findUniqueOrThrow.mockResolvedValueOnce(
        mockApplication,
      );

      await expect(
        service.findOne('app1', {
          id: 'user1',
          roles: [],
          createdAt: new Date(),
          updatedAt: new Date(),
          createdByUserId: null,
          updatedByUserId: null,
          email: '',
        }),
      ).resolves.toEqual(mockApplication);

      expect(prismaService.application.findUniqueOrThrow).toHaveBeenCalledTimes(1);
    });
  });

  describe('update', () => {
    it('should update an application by ID', async () => {
      const updateApplicationDto: UpdateApplicationDto = {
        name: 'Updated App',
      };
      const date = new Date();
      const mockUpdatedApplication: Application = {
        id: 'app1',
        name: 'Updated App',
        description: 'Description1',
        createdAt: date,
        createdByUserId: 'user1',
        updatedAt: date,
        updatedByUserId: 'user1',
        apiKey: 'key1',
      };

      prismaService.application.update.mockResolvedValueOnce(
        mockUpdatedApplication,
      );

      await expect(
        service.update('app1', updateApplicationDto, {
          id: 'user1',
          roles: [],
          createdAt: date,
          updatedAt: date,
          createdByUserId: null,
          updatedByUserId: null,
          email: '',
        }),
      ).resolves.toEqual(mockUpdatedApplication);
      expect(prismaService.application.update).toHaveBeenCalled()
    });
  });

  describe('rotateApiKey', () => {
    it('should rotate the API key of an application', async () => {
      const mockNewApiKey = '0000-1111-2222-3333-4444';
      const date = new Date();
      const mockRotatedApplication: Application = {
        id: 'app1',
        name: 'App1',
        description: 'Description1',
        createdAt: date,
        createdByUserId: 'user1',
        updatedAt: date,
        updatedByUserId: 'user1',
        apiKey: mockNewApiKey,
      };

      jest.spyOn(global.crypto, 'randomUUID').mockReturnValue(mockNewApiKey);

      prismaService.application.update.mockResolvedValueOnce(
        mockRotatedApplication,
      );

      await expect(
        service.rotateApiKey('app1', {
          id: 'user1',
          roles: [],
          createdAt: date,
          updatedAt: date,
          createdByUserId: null,
          updatedByUserId: null,
          email: '',
        }),
      ).resolves.toEqual(mockRotatedApplication);
      expect(prismaService.application.update).toHaveBeenCalledTimes(1);
    });
  });
});
