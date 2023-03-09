import { Test, TestingModule } from '@nestjs/testing';
import { getConnectionName } from 'nest-postgres';
import { DepartmentService } from './department.service';
import { DepartmentforDashboardDto } from './dto/DepartmentforDashboard.dto';
import { Client } from 'pg';
import { dbResponse } from '../db/db.response.type';
import { BadRequestException } from '@nestjs/common';

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
    command: '',
    rowCount: 1,
    oid: null,
    rows: [],
    _types: {},
    RowCtor: null,
    rowAsArray: true,
};

let service: DepartmentService;
let client: Client;
beforeEach(async () => {
    client = new Client();
    const module: TestingModule = await Test.createTestingModule({
        providers: [
            DepartmentService,
            {
                provide: getConnectionName({ clientOptions: client }),
                useValue: mClient,
            },
        ],
    }).compile();

    service = module.get<DepartmentService>(DepartmentService);
});

describe('DepartmentService', () => {
    describe('getDepartmentsById', () => {
        const expectData: DepartmentforDashboardDto[] = [
            {
                department_id: '1',
                name: 'ต้มไก่',
            },
        ];
        const res = { ...dbRes };
        res['rows'] = [...expectData];

        describe('given a valid manager id', () => {
            it('should return department data', async () => {
                const testData = '1';

                mClient.query.mockResolvedValueOnce(Promise.resolve(res));

                expect(await service.getDepartmentsById('1')).toEqual(
                    expectData
                );
            });
        });
        describe('given an invalid manager id', () => {
            it('should return a bad request expection', async () => {
                const testData = 'bad-id';

                await expect(
                    service.getDepartmentsById(testData)
                ).rejects.toThrow(BadRequestException);
            });
        });
    });
});
