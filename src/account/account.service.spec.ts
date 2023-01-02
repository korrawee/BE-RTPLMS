import { Test, TestingModule } from '@nestjs/testing';
import { Client } from 'pg';
import { getConnectionName } from 'nest-postgres';
import { dbResponse } from 'src/db/db.response.type';
import { AccountService } from './account.service';


jest.mock('pg', () => {
  const mClient = {
    connect: jest.fn(),
    query: jest.fn(),
    end: jest.fn(),
  };
  return { Client: jest.fn(() => mClient) };
});

const mClient = {
  connect: jest.fn(),
  query: jest.fn(),
  end: jest.fn(),
};

const dbRes: dbResponse = {
  "command": '',
  "rowCount": 1,
  "oid": null,
  "rows": [],
  "_types": {},
  "RowCtor": null,
  "rowAsArray": true,
}


describe('AccountService', () => {
  let service: AccountService;

  beforeEach(async () => {
    const client: Client = new Client();
    const module: TestingModule = await Test.createTestingModule({
      providers: [AccountService,{
        provide: getConnectionName({clientOptions: client}),
        useValue: mClient,
      }],
    }).compile();

    service = module.get<AccountService>(AccountService);
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
    const res = {...dbRes};
    res['rows'] = [{...data}];

    mClient.query.mockResolvedValueOnce(Promise.resolve(res));

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

    const res = {...dbRes};
    res['rows'] = [{...data}];

    mClient.query.mockResolvedValueOnce(Promise.resolve(res));

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

    const res = {...dbRes};
    res['rows'] = [{...data}];

    mClient.query.mockResolvedValueOnce(Promise.resolve(res));

    expect(await service.updateUsername('1', "newName")).toEqual(data);
  });
});
