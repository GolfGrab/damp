import { Test, TestingModule } from '@nestjs/testing';
import { NotificationCategoriesService } from './notification-categories.service';

describe('NotificationCategoriesService', () => {
  let service: NotificationCategoriesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NotificationCategoriesService],
    }).compile();

    service = module.get<NotificationCategoriesService>(
      NotificationCategoriesService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
