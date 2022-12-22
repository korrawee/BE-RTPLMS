import { Test, TestingModule } from '@nestjs/testing';
import { PG_CONNECTION } from '../constants';
import { ShiftforDashboardDto } from './dto/ShiftForDashboard.dto';
import { ShiftService } from './shift.service';

describe('ShiftService', () => {
  let service: ShiftService;
  const mockRepository = {
    getShiftsById: jest.fn(()=>{
      return [
        {
          shiftCode: "1",
          successProduct: 100,
          allMember: 20,
          checkInMember: 10
        },
        {
          shiftCode: "2",
          successProduct: 100,
          allMember: 20,
          checkInMember: 10
        }
      ]
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ShiftService, {
        provide: PG_CONNECTION,
        useValue: mockRepository,
      }],
    }).compile();

    service = module.get<ShiftService>(PG_CONNECTION);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should get all shifts in a department.', () => {

    const dto: ShiftforDashboardDto[] = [
      {
        shiftCode: "1",
        successProduct: 100,
        allMember: 20,
        checkInMember: 10
      },
      {
        shiftCode: "2",
        successProduct: 100,
        allMember: 20,
        checkInMember: 10
      }
    ];

    expect(service.getShiftsById('1')).toEqual(dto)
  });
});
