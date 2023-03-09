import { Test, TestingModule } from '@nestjs/testing';
import { WorkOnService } from './work-on.service';
import { getConnectionName } from 'nest-postgres';
import { dbResponse } from '../../db/db.response.type';
import { Client } from 'pg';
import { WorkOnPostDeleteDto } from './dto/WorkOnPostDeleteDto';
import { FilteredAccountDto } from '../../relations/work-on/dto/FilteredAccount.dto';

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

describe('WorkOnService', () => {
    let service: WorkOnService;

    beforeEach(async () => {
        const client: Client = new Client();
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                WorkOnService,
                {
                    provide: getConnectionName({ clientOptions: client }),
                    useValue: mClient,
                },
            ],
        }).compile();

        service = module.get<WorkOnService>(WorkOnService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    //it should find all workOn by shiftId
    it('should find all workOn by shiftId', async () => {
        const res = { ...dbRes };
        const queryData = [
            {
                name: 'full-name2',
                checkInTime: '07:00:00',
                checkOutTime: '-',
                checkInStatus: 'ปกติ',
            },
        ];

        res['rows'] = queryData;

        mClient.query.mockResolvedValueOnce(res);
        expect(await service.findAllByShiftId('1')).toEqual(queryData);
    });
    it('should find all workOn by shiftId', async () => {
        const res = { ...dbRes };
        const queryData = [
            {
                name: 'full-name2',
                checkInTime: '07:00:00',
                checkOutTime: '-',
                checkInStatus: 'ปกติ',
            },
        ];

        res['rows'] = queryData;

        mClient.query.mockResolvedValueOnce(res);
        expect(await service.findAllByShiftId('1')).toEqual(queryData);
    });
    it('should find get free worker by managerId and date', async () => {
        const mngId = '1';
        const shiftCode = '2';
        const date = '2023-01-09';
        const res = { ...dbRes };
        const queryData = [
            {
                account_id: '1',
                fullname: 'full-name1',
                perfermance: 50,
            },
        ];

        res['rows'] = queryData;

        mClient.query.mockResolvedValueOnce(res);
        expect(await service.getFreeWorker(mngId, shiftCode, date)).toEqual(
            queryData
        );
    });
    it('should create work_on', async () => {
        const res = {
            status: 200,
            message: 'Insert Successful...',
        };
        const body: WorkOnPostDeleteDto = {
            shiftCode: '1',
            date: '2023-01-09',
            accountIds: ['1', '4', '5', '8', '9'],
        };
        mClient.query.mockResolvedValueOnce(res);
        expect(await service.createWorkOn(body)).toEqual(res);
    });

    it('should delete work_on', async () => {
        const res = {
            status: 200,
            message: 'Delete Successful...',
        };
        const body: WorkOnPostDeleteDto = {
            shiftCode: '1',
            date: '2023-01-09',
            accountIds: ['1', '4', '5', '8', '9'],
        };
        mClient.query.mockResolvedValueOnce(res);
        expect(await service.deleteWorkOn(body)).toEqual(res);
    });

    it('should get work on of given shift', async () => {
        const data = [
            {
                account_id: '1',
                shift_code: '2',
                checkin_time: null,
                checkout_time: null,
                ot: null,
                date: '2023-01-08T17:00:00.000Z',
            },
        ];
        const shiftCode = '2';
        const date = '2023-01-09';

        const res = { ...dbRes };
        res['rows'] = [...data];

        mClient.query.mockResolvedValueOnce(res);
        expect(await service.getWorkOnOfShift(shiftCode, date)).toEqual(data);
    });

    it('should get filtered account ids', async () => {
        const shiftId = '1';
        const sortBy = 'person';
        const quantity = 2;
        const data: FilteredAccountDto[] = [
            {
                account_id: '2',
            },
            {
                account_id: '3',
            },
        ];

        const res = { ...dbRes };
        res['rows'] = [...data];

        mClient.query.mockResolvedValueOnce(res);
        expect(
            await service.getAccountIdSortByCheckIn(shiftId, quantity)
        ).toEqual(data);
    });
});
