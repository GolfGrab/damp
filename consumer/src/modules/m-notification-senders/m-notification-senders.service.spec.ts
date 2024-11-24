import { Test, TestingModule } from '@nestjs/testing';
import { MNotificationSendersService } from './m-notification-senders.service';

describe('MNotificationSendersService', () => {
  let service: MNotificationSendersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MNotificationSendersService],
    }).compile();

    service = module.get<MNotificationSendersService>(MNotificationSendersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
