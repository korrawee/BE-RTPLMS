import { Test, TestingModule } from '@nestjs/testing';
import { PG_CONNECTION } from '../constants';
import { AccountService } from './account.service';

describe('AccountService', () => {
  let service: AccountService;
  
  const mockRepository = {
    create: jest.fn().mockImplementation((dto) => {
      return Promise.resolve(dto)
    }),
    findAll: jest.fn().mockImplementation(async () => {
      return Promise.resolve([
        {
          account_id: '1',
          username: 'user',
          password: 'pwd',
          fullname: 'name name',
          role: 'worker',
          telephone: "0987654321",
          performance: 100,
          details: { address: '1/222'},
          mng_id: '2',
        },
      ]);
    }),
    find: jest.fn().mockImplementation(async (id: string) => {
      return Promise.resolve(
        {
          account_id: '1',
          username: 'user',
          password: 'pwd',
          fullname: 'name name',
          role: 'worker',
          telephone: "0987654321",
          performance: 100,
          details: { address: '1/222'},
          mng_id: '2',
        }
      );
    }),
    updateUsername: jest.fn().mockImplementation(async (id: string, newUsername: string) => {
      return Promise.resolve(
        {
          account_id: id,
          username: newUsername,
          password: 'pwd',
          fullname: 'name name',
          role: 'worker',
          telephone: "0987654321",
          performance: 100,
          details: { address: '1/222'},
          mng_id: '2',
        }
      );
    })
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AccountService, {
        provide: PG_CONNECTION,
        useValue: mockRepository,
      }],
    }).compile();

    service = module.get<AccountService>(PG_CONNECTION);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should be find all accounts', async () => {
    const data = {
      account_id: '1',
      username: 'user',
      password: 'pwd',
      fullname: 'name name',
      role: 'worker',
      telephone: "0987654321",
      performance: 100,
      details: { address: '1/222'},
      mng_id: '2',
    }
    expect(await service.findAll()).toEqual([data]);
  });

  it('should be find a account', async () => {
    const data = {
      account_id: '1',
      username: 'user',
      password: 'pwd',
      fullname: 'name name',
      role: 'worker',
      telephone: "0987654321",
      performance: 100,
      details: { address: '1/222'},
      mng_id: '2',
    }
    expect(await service.find('1')).toEqual(data);
  });

  it('should be update a account by account_id', async () => {
    const data = {
      account_id: '1',
      username: 'newName',
      password: 'pwd',
      fullname: 'name name',
      role: 'worker',
      telephone: "0987654321",
      performance: 100,
      details: { address: '1/222'},
      mng_id: '2',
    }
    expect(await service.updateUsername('1', "newName")).toEqual(data);
  });
});
