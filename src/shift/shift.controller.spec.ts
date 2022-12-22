import { Test, TestingModule } from '@nestjs/testing';
import { ShiftforDashboardDto } from './dto/ShiftForDashboard.dto';
import { ShiftController } from './shift.controller';
import { ShiftService } from './shift.service';

describe('ShiftController', () => {
  let controller: ShiftController;
  const mockShiftService = {
    getShiftsById: jest.fn((departmentId: string)=>{
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
      controllers: [ShiftController],
      providers: [ShiftService],
    }).overrideProvider(ShiftService).useValue(mockShiftService).compile();

    controller = module.get<ShiftController>(ShiftController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should get all shifts in department by department\'s id', ()=>{
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
    ]

    expect(controller.getshift('1')).toEqual(dto);
  })
});
