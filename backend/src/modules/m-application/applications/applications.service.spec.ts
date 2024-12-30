/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { Application } from '@prisma/client';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { PrismaService } from 'nestjs-prisma';
import { ApplicationsService } from './applications.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { ApplicationWithApiKey } from './entities/application-with-api-key';

describe('ApplicationsService', () => {
  let service: ApplicationsService;
  let prismaService: DeepMockProxy<PrismaService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicationsService,
        { provide: PrismaService, useValue: mockDeep<PrismaService>() },
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
        createdByUserId: 'user123',
        description: 'Test Description',
        id: 'app123',
        updatedByUserId: 'user123',
      };

      const mockApiKey = '1234-5678-9012-3456-7890';

      const mockCreatedApplication: ApplicationWithApiKey = {
        ...createApplicationDto,
        apiKey: mockApiKey,
        isEnabled: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(global.crypto, 'randomUUID').mockReturnValue(mockApiKey);

      prismaService.application.create.mockResolvedValueOnce(
        mockCreatedApplication,
      );

      await expect(service.create(createApplicationDto)).resolves.toEqual(
        mockCreatedApplication,
      );
      expect(prismaService.application.create).toHaveBeenCalledWith({
        data: {
          name: 'Test App',
          description: 'Test Description',
          createdByUserId: 'user123',
          updatedByUserId: 'user123',
          id: 'app123',
          apiKey: mockApiKey,
        },
        select: service.selectAllFieldsIncludingApiKey,
      });
    });
  });

  describe('findAll', () => {
    it('should return all applications', async () => {
      const mockApplications: Application[] = [
        {
          id: 'app1',
          name: 'App1',
          description: 'Description1',
          isEnabled: true,
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
          isEnabled: true,
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

      await expect(service.findAll()).resolves.toEqual(mockApplications);
      expect(prismaService.application.findMany).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a single application by ID', async () => {
      const mockApplication: Application = {
        id: 'app1',
        name: 'App1',
        description: 'Description1',
        isEnabled: true,
        createdAt: new Date(),
        createdByUserId: 'user1',
        updatedAt: new Date(),
        updatedByUserId: 'user1',
        apiKey: 'key1',
      };

      prismaService.application.findUniqueOrThrow.mockResolvedValueOnce(
        mockApplication,
      );

      await expect(service.findOne('app1')).resolves.toEqual(mockApplication);
      expect(prismaService.application.findUniqueOrThrow).toHaveBeenCalledWith({
        where: { id: 'app1' },
      });
    });
  });

  describe('update', () => {
    it('should update an application by ID', async () => {
      const updateApplicationDto = { name: 'Updated App' };
      const mockUpdatedApplication: Application = {
        id: 'app1',
        name: 'Updated App',
        description: 'Description1',
        isEnabled: true,
        createdAt: new Date(),
        createdByUserId: 'user1',
        updatedAt: new Date(),
        updatedByUserId: 'user1',
        apiKey: 'key1',
      };

      prismaService.application.update.mockResolvedValueOnce(
        mockUpdatedApplication,
      );

      await expect(
        service.update('app1', updateApplicationDto),
      ).resolves.toEqual(mockUpdatedApplication);
      expect(prismaService.application.update).toHaveBeenCalledWith({
        where: { id: 'app1' },
        data: updateApplicationDto,
      });
    });
  });

  describe('rotateApiKey', () => {
    it('should rotate the API key of an application', async () => {
      const mockNewApiKey = '0000-1111-2222-3333-4444';

      const mockRotatedApplication: Application = {
        id: 'app1',
        name: 'App1',
        description: 'Description1',
        isEnabled: true,
        createdAt: new Date(),
        createdByUserId: 'user1',
        updatedAt: new Date(),
        updatedByUserId: 'user1',
        apiKey: mockNewApiKey,
      };

      jest.spyOn(global.crypto, 'randomUUID').mockReturnValue(mockNewApiKey);

      prismaService.application.update.mockResolvedValueOnce(
        mockRotatedApplication,
      );

      await expect(service.rotateApiKey('app1')).resolves.toEqual(
        mockRotatedApplication,
      );
      expect(prismaService.application.update).toHaveBeenCalledWith({
        where: { id: 'app1' },
        data: {
          apiKey: mockNewApiKey,
        },
        select: service.selectAllFieldsIncludingApiKey,
      });
    });
  });
});
