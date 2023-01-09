import { Test, TestingModule } from '@nestjs/testing';
import { Client } from 'pg';
import { getConnectionName } from 'nest-postgres';
import { dbResponse } from 'src/db/db.response.type';
import { RequestService } from './request.service';

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

describe('RequestService', () => {
  let service: RequestService;

  beforeEach(async () => {
    const client: Client = new Client();
    const module: TestingModule = await Test.createTestingModule({
      providers: [RequestService, {
        provide: getConnectionName({clientOptions: client}),
        useValue: mClient
      }],
    }).compile();

    service = module.get<RequestService>(RequestService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should get [ number of hour, req_status ] by shiftCode, accountId, and date', async () => {
    const queryData = {
      number_of_hour: 4,
      req_status: 'รอดำเนินการ',
    };
    const res = {...dbRes};
    res['rows'] = [queryData]

    mClient.query.mockResolvedValueOnce(res);

    expect(await service.getRequest('1','2', '2023-01-06')).toEqual(queryData);
  })
});
