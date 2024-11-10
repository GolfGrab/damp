import { Test, TestingModule } from '@nestjs/testing';
import { MNotificationController } from './m-notification.controller';

describe('MNotificationController', () => {
  let controller: MNotificationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MNotificationController],
    }).compile();

    controller = module.get<MNotificationController>(MNotificationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
