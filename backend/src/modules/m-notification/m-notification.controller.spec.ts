import { ApiKeyGuard } from '@/auth/api-key.guard';
import { Test, TestingModule } from '@nestjs/testing';
import { mockDeep } from 'jest-mock-extended';
import { MNotificationController } from './m-notification.controller';
import { NotificationsService } from './notifications/notifications.service';
import { TemplatesService } from './templates/templates.service';
import { AuthService } from '@/auth/auth.service';

describe('MNotificationController', () => {
  let controller: MNotificationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MNotificationController],
      providers: [
        { provide: TemplatesService, useValue: mockDeep<TemplatesService>() },
        {
          provide: NotificationsService,
          useValue: mockDeep<NotificationsService>(),
        },
        {
          provide: AuthService,
          useValue: mockDeep<AuthService>(),
        },
      ],
    }).compile();

    controller = module.get<MNotificationController>(MNotificationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
