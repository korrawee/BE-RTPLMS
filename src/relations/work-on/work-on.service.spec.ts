import { Test, TestingModule } from '@nestjs/testing';
import { WorkOnService } from './work-on.service';
import { getConnectionName } from 'nest-postgres';
import { dbResponse } from 'src/db/db.response.type';
import { Client } from 'pg';

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

describe('WorkOnService', () => {
  let service: WorkOnService;

  beforeEach(async () => {
    const client: Client = new Client();
    const module: TestingModule = await Test.createTestingModule({
      providers: [WorkOnService,{
        provide: getConnectionName({clientOptions: client}),
        useValue: mClient
      }],
    }).compile();

    service = module.get<WorkOnService>(WorkOnService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  //it should find all workOn by shiftId
  it('should find all workOn by shiftId', async () => {
    const res = {...dbRes};
    const queryData = [
      {
        "name": "full-name2",
        "checkInTime": "07:00:00",
        "checkOutTime": "-",
        "checkInStatus": "ปกติ"
      }
    ];
    
    res['rows'] = queryData;

    mClient.query.mockResolvedValueOnce(res);
    expect(await service.findAllByShiftId('1')).toEqual(queryData);
  
  })
 
});
