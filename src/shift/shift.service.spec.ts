import { Test, TestingModule } from '@nestjs/testing';
import { getConnectionName } from 'nest-postgres';
import { dbResponse } from '../../db/db.response.type';
import { ShiftforDashboardDto } from './dto/ShiftForDashboard.dto';
import { ShiftService } from './shift.service';
import { Client } from 'pg';
import { ShiftforDashboardAttrDto } from './dto/ShiftForDashboardAttr.dto';
import { ShiftInDepartmentDto } from './dto/ShiftInDepartment.dto';

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

describe('ShiftService', () => {
    let service: ShiftService;
    const mockRepository = {
        getShiftsById: jest.fn(() => {
            return [
                {
                    shiftCode: '1',
                    successProduct: 100,
                    allMember: 20,
                    checkInMember: 10,
                },
                {
                    shiftCode: '2',
                    successProduct: 100,
                    allMember: 20,
                    checkInMember: 10,
                },
            ];
        }),
    };

    beforeEach(async () => {
        const client: Client = new Client();
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ShiftService,
                {
                    provide: getConnectionName({ clientOptions: client }),
                    useValue: mClient,
                },
            ],
        }).compile();

        service = module.get<ShiftService>(ShiftService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should get all shifts in a department.', async () => {
        const mockReturnValue: ShiftforDashboardDto = {
            shiftCode: '1',
            successProduct: 100,
            allMember: 20,
            checkInMember: 10,
        };

        const mockShiftforDashboard: ShiftforDashboardAttrDto[] = [
            {
                shift_code: '1',
                success_product: 100,
                all_member: 20,
                checkin_member: 10,
            },
        ];

        const res = { ...dbRes };
        res['rows'] = [...mockShiftforDashboard];

        const spygetShifts = jest
            .spyOn(service, 'getshifts')
            .mockReturnValueOnce(Promise.resolve(mockReturnValue));
        const spygetShiftsById = jest.spyOn(service, 'getShiftsById');

        mClient.query.mockResolvedValue(Promise.resolve(res));

        expect(await service.getShiftsById(['1'])).toEqual([mockReturnValue]);
    });
});
