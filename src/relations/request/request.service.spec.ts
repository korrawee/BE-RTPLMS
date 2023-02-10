import { Test, TestingModule } from '@nestjs/testing';
import { Client } from 'pg';
import { getConnectionName } from 'nest-postgres';
import { dbResponse } from 'src/db/db.response.type';
import { RequestService } from './request.service';
import { RequestForOtDetailDto } from './dto/RequestForOtDetail.dto';
import { RequestDto } from './dto/Request.dto';
import { CreateOtRequestDto } from './dto/createOtRequest.dto';
import { WorkOnService } from '../work-on/work-on.service';

const moment = require('moment');


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
  let requestService: RequestService;
  let workOnService: WorkOnService;
  beforeEach(async () => {
    const client: Client = new Client();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RequestService, 
        {
          provide: getConnectionName({clientOptions: client}),
          useValue: mClient
        },
        WorkOnService,
      ],
    }).compile();

    requestService = module.get<RequestService>(RequestService);
    workOnService = module.get<WorkOnService>(WorkOnService);
  });

  it('should be defined', () => {
    expect(requestService).toBeDefined();
  });

  it('should get [ number of hour, req_status ] by shiftCode, accountId, and date', async () => {
    const queryData = {
      number_of_hour: 4,
      req_status: 'รอดำเนินการ',
    };
    const res = {...dbRes};
    res['rows'] = [queryData]

    mClient.query.mockResolvedValueOnce(res);

    expect(await requestService.getRequest('1','2', '2023-01-06')).toEqual(queryData);
  })

  it('should get all shifts by given shiftCode and date', async ()=>{
    const shiftCode = '1';
    const date = '2023-09-01';
    
    const expectResult: RequestForOtDetailDto[] = [
      {
        shiftCode: '1',
        accountId: '1',
        accountName: 'full-name',
        numberOfHour: 4,
        reqStatus: 'รอดำเนินการ'
      },
    ]
    const res = {...dbRes};
    res['rows'] = expectResult;

    mClient.query.mockResolvedValueOnce(res);
    expect(await requestService.getAllRequestByShiftAndDate(shiftCode, date)).toEqual(expectResult);
  });

  it('should create ot request', async ()=>{
    
    const body: CreateOtRequestDto = {
      shiftCode: '2',
      unit: 'hour',
      date: '2023-01-09',
      quantity: 3,
      method: '',
      accountIds: [
        '2',
      ],
      mngId: '1',
    };
    const expectResult: RequestDto[] = [
      {
        shift_code: '2',
        account_id: '2',
        mng_id: '1',
        date: '2023-01-09',
        number_of_hour: 3,
        req_status: 'รอดำเนินการ',
        created_at: moment('2023-01-09 11:40 PM', 'YYYY-MM-DD hh:mm A'),
      }
    ]

    const res = {...dbRes};
    res['rows'] = [...expectResult]


    mClient.query.mockResolvedValueOnce(res);

    expect(await requestService.createOtRequest(body)).toEqual(expectResult);
  });

  //getRequestByAccountId
});
