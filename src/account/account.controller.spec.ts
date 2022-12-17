import { Test, TestingModule } from '@nestjs/testing';
import { AccountController } from './account.controller';
import { AccountService } from './account.service';

describe('AccountController', () => {
  let controller: AccountController;

  const mockAccountService = {
    create: jest.fn((dto) => {
      return {
        account_id: '1',
        ...dto
      }
    }),

    updateUsername: jest.fn((id: string, newName: string) => {
      return {
        account_id: id,
        username: newName,
      }
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AccountController],
      providers: [AccountService],
    }).overrideProvider(AccountService).useValue(mockAccountService).compile();

    controller = module.get<AccountController>(AccountController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a account', () => {

    const dto = {
      username: 'manager',
      password: "password",
      fullname: "name",
      role: 'manager',
      telephone: '0987654321',
      performance: 100,
      details: {},
      mng_id: '2',
    };

    expect(controller.create(dto)).toEqual({
      account_id: expect.any(String),
      ...dto,
    });
  
    expect(mockAccountService.create).toHaveBeenCalledWith(dto);
  });

  it('should update a username by account_id', () => {

    const newUsername = 'newname';

    expect(controller.updateUsername('1', newUsername)).toEqual({
      account_id: '1',
      username: newUsername,
    });
  
    expect(mockAccountService.updateUsername).toHaveBeenCalledWith('1', newUsername);
  });

});
