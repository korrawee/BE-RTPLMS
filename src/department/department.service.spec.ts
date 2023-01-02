import { Test, TestingModule } from '@nestjs/testing';
import { getConnectionName } from 'nest-postgres';
import { DepartmentService } from './department.service';
import { DepartmentforDashboardDto } from './dto/DepartmentforDashboard.dto';
import { Client } from 'pg';
import { dbResponse } from '../db/db.response.type';

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

describe('DepartmentService', () => {
  let service: DepartmentService;
  let client: Client;
  beforeEach(async () => {
    client = new Client();
    const module: TestingModule = await Test.createTestingModule({
      providers: [DepartmentService,{
        provide: getConnectionName({clientOptions: client}),
        useValue: mClient,
      }],
    }).compile();

    service = module.get<DepartmentService>(DepartmentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should find a department by manager\'s id', async () => {
    const data: DepartmentforDashboardDto[] = [
      {
        department_id: '1',
        name: 'ต้มไก่',
      }
    ]
    const res = {...dbRes};
    res['rows'] = [{
      department_id: '1',
      name: 'ต้มไก่',
    }];

    mClient.query.mockResolvedValueOnce(Promise.resolve(res));

    expect(await service.getDepartmentsById('1')).toEqual(data);
  });
});
