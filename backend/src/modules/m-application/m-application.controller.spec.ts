import { Test, TestingModule } from '@nestjs/testing';
import { MApplicationController } from './m-application.controller';

describe('MApplicationController', () => {
  let controller: MApplicationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MApplicationController],
    }).compile();

    controller = module.get<MApplicationController>(MApplicationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
