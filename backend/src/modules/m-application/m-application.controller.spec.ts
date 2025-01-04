/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { ApplicationsService } from './applications/applications.service';
import { CreateApplicationDto } from './applications/dto/create-application.dto';
import { UpdateApplicationDto } from './applications/dto/update-application.dto';
import { ApplicationWithApiKey } from './applications/entities/application-with-api-key';
import { Application } from './applications/entities/application.entity';
import { MApplicationController } from './m-application.controller';
import { CreateNotificationCategoryDto } from './notification-categories/dto/create-notification-category.dto';
import { UpdateNotificationCategoryDto } from './notification-categories/dto/update-notification-category.dto';
import { NotificationCategory } from './notification-categories/entities/notification-category.entity';
import { NotificationCategoriesService } from './notification-categories/notification-categories.service';
describe('MApplicationController', () => {
  let controller: MApplicationController;
  let applicationsService: DeepMockProxy<ApplicationsService>;
  let notificationCategoriesService: DeepMockProxy<NotificationCategoriesService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MApplicationController],
      providers: [
        {
          provide: ApplicationsService,
          useValue: mockDeep<ApplicationsService>(),
        },
        {
          provide: NotificationCategoriesService,
          useValue: mockDeep<NotificationCategoriesService>(),
        },
      ],
    }).compile();

    controller = module.get<MApplicationController>(MApplicationController);
    applicationsService = module.get(ApplicationsService);
    notificationCategoriesService = module.get(NotificationCategoriesService);
  });

  it('should be defined when instantiated', () => {
    expect(controller).toBeDefined();
  });

  describe('Applications', () => {
    it('should create an application when valid data is provided', async () => {
      const createDto: CreateApplicationDto = {
        id: 'app1',
        name: 'New App',
        description: 'Description of the new app',
        createdByUserId: 'user1',
        updatedByUserId: 'user1',
      };
      const mockApplicationWithApiKey: ApplicationWithApiKey = {
        apiKey: 'new-api-key',
        createdAt: new Date(),
        updatedAt: new Date(),
        isEnabled: true,
        ...createDto,
      };
      applicationsService.create.mockResolvedValueOnce(
        mockApplicationWithApiKey,
      );

      const result = await controller.createApplication(createDto);
      expect(applicationsService.create).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(mockApplicationWithApiKey);
    });

    it('should return all applications when requested', async () => {
      const mockApplications: Application[] = [
        {
          id: 'app1',
          name: 'App 1',
          description: '',
          createdByUserId: 'user1',
          updatedByUserId: 'user1',
          createdAt: new Date(),
          updatedAt: new Date(),
          isEnabled: true,
        },
      ];
      applicationsService.findAll.mockResolvedValueOnce(mockApplications);

      const result = await controller.findAllApplications();
      expect(applicationsService.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockApplications);
    });

    it('should return applications by user ID when user ID is provided', async () => {
      const userId = 'user1';
      const mockApplications: Application[] = [
        {
          id: 'app1',
          name: 'App 1',
          description: '',
          createdByUserId: userId,
          updatedByUserId: userId,
          createdAt: new Date(),
          updatedAt: new Date(),
          isEnabled: true,
        },
      ];
      applicationsService.findAllByCreatedByUserId.mockResolvedValueOnce(
        mockApplications,
      );

      const result = await controller.findAllApplicationsByUserId(userId);
      expect(applicationsService.findAllByCreatedByUserId).toHaveBeenCalledWith(
        userId,
      );
      expect(result).toEqual(mockApplications);
    });

    it('should find an application when application ID is provided', async () => {
      const applicationId = 'app1';
      const mockApplication: Application = {
        id: applicationId,
        name: 'App 1',
        description: 'Description of App 1',
        createdByUserId: 'user1',
        updatedByUserId: 'user1',
        createdAt: new Date(),
        updatedAt: new Date(),
        isEnabled: true,
      };
      applicationsService.findOne.mockResolvedValueOnce(mockApplication);

      const result = await controller.findOneApplication(applicationId);
      expect(applicationsService.findOne).toHaveBeenCalledWith(applicationId);
      expect(result).toEqual(mockApplication);
    });

    it('should update an application when valid data is provided', async () => {
      const applicationId = 'app1';
      const updateDto: UpdateApplicationDto = {
        name: 'Updated App Name',
        description: 'Updated Description',
        updatedByUserId: 'user2',
      };
      const mockUpdatedApplication: Application = {
        name: 'old name',
        description: 'old description',
        createdByUserId: 'user1',
        updatedByUserId: 'old user',
        id: applicationId,
        createdAt: new Date(),
        updatedAt: new Date(),
        isEnabled: true,
        ...updateDto,
      };
      applicationsService.update.mockResolvedValueOnce(mockUpdatedApplication);

      const result = await controller.updateApplication(
        applicationId,
        updateDto,
      );
      expect(applicationsService.update).toHaveBeenCalledWith(
        applicationId,
        updateDto,
      );
      expect(result).toEqual(mockUpdatedApplication);
    });

    it('should rotate an API key when application ID is provided', async () => {
      const applicationId = 'app1';
      const mockApplicationWithApiKey: ApplicationWithApiKey = {
        id: applicationId,
        name: 'App 1',
        description: '',
        apiKey: 'rotated-api-key',
        createdByUserId: 'user1',
        updatedByUserId: 'user1',
        createdAt: new Date(),
        updatedAt: new Date(),
        isEnabled: true,
      };
      applicationsService.rotateApiKey.mockResolvedValueOnce(
        mockApplicationWithApiKey,
      );

      const result = await controller.rotateApiKey(applicationId);
      expect(applicationsService.rotateApiKey).toHaveBeenCalledWith(
        applicationId,
      );
      expect(result).toEqual(mockApplicationWithApiKey);
    });
  });

  describe('Notification Categories', () => {
    it('should create a notification category when valid data is provided', async () => {
      const applicationId = 'app1';
      const createDto: CreateNotificationCategoryDto = {
        id: 'cat1',
        name: 'New Category',
        createdByUserId: 'user1',
        updatedByUserId: 'user1',
      };
      const mockCategory: NotificationCategory = {
        applicationId: applicationId,
        createdAt: new Date(),
        updatedAt: new Date(),
        ...createDto,
      };
      notificationCategoriesService.create.mockResolvedValueOnce(mockCategory);

      const result = await controller.createNotificationCategory(
        applicationId,
        createDto,
      );
      expect(notificationCategoriesService.create).toHaveBeenCalledWith(
        applicationId,
        createDto,
      );
      expect(result).toEqual(mockCategory);
    });

    it('should return all notification categories when requested', async () => {
      const mockCategories: NotificationCategory[] = [
        {
          id: 'cat1',
          name: 'Category 1',
          applicationId: 'app1',
          createdByUserId: 'user1',
          updatedByUserId: 'user1',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      notificationCategoriesService.findAll.mockResolvedValueOnce(
        mockCategories,
      );

      const result = await controller.findAllNotificationCategories();
      expect(notificationCategoriesService.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockCategories);
    });

    it('should return all notification categories by application ID when application ID is provided', async () => {
      const applicationId = 'app1';
      const mockCategories: NotificationCategory[] = [
        {
          id: 'cat1',
          name: 'Category 1',
          applicationId: applicationId,
          createdByUserId: 'user1',
          updatedByUserId: 'user1',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      notificationCategoriesService.findAllByApplicationId.mockResolvedValueOnce(
        mockCategories,
      );

      const result =
        await controller.findAllNotificationCategoriesByApplicationId(
          applicationId,
        );
      expect(
        notificationCategoriesService.findAllByApplicationId,
      ).toHaveBeenCalledWith(applicationId);
      expect(result).toEqual(mockCategories);
    });

    it('should find a notification category when category ID is provided', async () => {
      const categoryId = 'cat1';
      const mockCategory: NotificationCategory = {
        id: categoryId,
        name: 'Category 1',
        applicationId: 'app1',
        createdByUserId: 'user1',
        updatedByUserId: 'user1',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      notificationCategoriesService.findOne.mockResolvedValueOnce(mockCategory);

      const result = await controller.findOneNotificationCategory(categoryId);
      expect(notificationCategoriesService.findOne).toHaveBeenCalledWith(
        categoryId,
      );
      expect(result).toEqual(mockCategory);
    });

    it('should update a notification category when valid data is provided', async () => {
      const categoryId = 'cat1';
      const updateDto: UpdateNotificationCategoryDto = {
        name: 'Updated Category',
        updatedByUserId: 'user2',
      };
      const mockUpdatedCategory: NotificationCategory = {
        id: categoryId,
        name: 'old name',
        applicationId: 'app1',
        createdByUserId: 'user1',
        updatedByUserId: 'old user',
        createdAt: new Date(),
        updatedAt: new Date(),
        ...updateDto,
      };
      notificationCategoriesService.update.mockResolvedValueOnce(
        mockUpdatedCategory,
      );

      const result = await controller.updateNotificationCategory(
        categoryId,
        updateDto,
      );
      expect(notificationCategoriesService.update).toHaveBeenCalledWith(
        categoryId,
        updateDto,
      );
      expect(result).toEqual(mockUpdatedCategory);
    });
  });
});
