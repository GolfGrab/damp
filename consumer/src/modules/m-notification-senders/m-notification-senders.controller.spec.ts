import { Test, TestingModule } from '@nestjs/testing';
import { MNotificationSendersController } from './m-notification-senders.controller';
import { MNotificationSendersService } from './m-notification-senders.service';

describe('MNotificationSendersController', () => {
  let controller: MNotificationSendersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MNotificationSendersController],
      providers: [MNotificationSendersService],
    }).compile();

    controller = module.get<MNotificationSendersController>(MNotificationSendersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
