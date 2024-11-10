import { Test, TestingModule } from '@nestjs/testing';
import { MUserController } from './m-user.controller';

describe('MUserController', () => {
  let controller: MUserController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MUserController],
    }).compile();

    controller = module.get<MUserController>(MUserController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
