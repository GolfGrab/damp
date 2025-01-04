import { Test, TestingModule } from '@nestjs/testing';
import { mockDeep } from 'jest-mock-extended';
import { AccountsService } from './accounts/accounts.service';
import { MUserController } from './m-user.controller';
import { UserPreferencesService } from './user-preferences/user-preferences.service';
import { UsersService } from './users/users.service';

describe('MUserController', () => {
  let controller: MUserController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MUserController],
      providers: [
        {
          provide: AccountsService,
          useValue: mockDeep<AccountsService>(),
        },
        {
          provide: UsersService,
          useValue: mockDeep<UsersService>(),
        },
        {
          provide: UserPreferencesService,
          useValue: mockDeep<UserPreferencesService>(),
        },
      ],
    }).compile();

    controller = module.get<MUserController>(MUserController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
