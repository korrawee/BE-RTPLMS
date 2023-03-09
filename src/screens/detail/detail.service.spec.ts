import { Test, TestingModule } from '@nestjs/testing';
import { DetailService } from './detail.service';
import { dbResponse } from '../../db/db.response.type';
import { Client } from 'pg';
import { getConnectionName } from 'nest-postgres';
import { WorkOnService } from '../../relations/work-on/work-on.service';
import { RequestService } from '../../relations/request/request.service';
import { AccountService } from '../../account/account.service';
import { WorkOnDto } from '../../relations/work-on/dto/WorkOn.dto';
import { AccountDto } from '../../account/dto/AccountDto';

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

describe('DetailService', () => {
    let detailService: DetailService;
    let workOnService: WorkOnService;
    let requestService: RequestService;
    let accountService: AccountService;
    beforeEach(async () => {
        const client: Client = new Client();
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                DetailService,
                WorkOnService,
                RequestService,
                AccountService,
                {
                    provide: getConnectionName({ clientOptions: client }),
                    useValue: mClient,
                },
            ],
        }).compile();

        detailService = module.get<DetailService>(DetailService);
        workOnService = module.get<WorkOnService>(WorkOnService);
        requestService = module.get<RequestService>(RequestService);
        accountService = module.get<AccountService>(AccountService);
    });

    it('should be defined', () => {
        expect(detailService).toBeDefined();
    });

    it('should get data for detail page', async () => {
        const mockFindAllByShiftId: WorkOnDto[] = [
            {
                account_id: '3',
                shift_code: '1',
                checkin_time: '08:00:00',
                checkout_time: null,
                ot: null,
                date: '2023-01-08T17:00:00.000Z',
                checkin_status: 'ปกติ',
            },
        ];

        const mockFindByIds: AccountDto[] = [
            {
                account_id: '3',
                username: 'user3',
                password: '1234',
                fullname: 'full-name3',
                role: 'worker',
                telephone: '0981',
                performance: 12.0,
                details: { data: 'eiei' },
                mng_id: null,
            },
        ];

        const mockGetRequest = {
            number_of_hour: '4',
            req_status: 'รอดำเนินการ',
        };

        const data = [
            {
                name: 'full-name3',
                checkInTime: '08:00:00',
                checkOutTime: '-',
                checkInStatus: 'ปกติ',
                otStatus: 'รอดำเนินการ',
                otDuration: '4',
            },
        ];

        const spyOnWorkOnService = jest
            .spyOn(workOnService, 'findAllByShiftId')
            .mockResolvedValueOnce(mockFindAllByShiftId);
        const spyOnAccountService = jest
            .spyOn(accountService, 'findByIds')
            .mockResolvedValueOnce(mockFindByIds);
        const spyOnRequestService = jest
            .spyOn(requestService, 'getRequest')
            .mockResolvedValue(mockGetRequest);

        expect(await detailService.getData('1')).toEqual(data);
    });
});
