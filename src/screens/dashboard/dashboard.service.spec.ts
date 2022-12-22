import { Test, TestingModule } from '@nestjs/testing';
import { DepartmentService } from '../../department/department.service';
import { ShiftService } from '../../shift/shift.service';
import { PG_CONNECTION } from '../../constants';
import { DashboardService } from './dashboard.service';
import { DashboardCardDto } from './dto/dashboardCard.dto';

describe('DashboardService', () => {
  let service: DashboardService;
  
  const mockRepository = {
    getData: jest.fn().mockImplementation((mngId: string) => {
      return {
        department: {
          department_id: "1",
          name: "ต้มไก่"
        },
        shifts: [
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
      }
    }),
  };

  const mockShiftRepository = {
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
    })
  }

  const mockDepartmentRepository = {
    getDepartmentById: jest.fn((mngId: string)=>{
      return {
        department_id: "1",
        name: "ต้มไก่"
      }
    }),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DashboardService, {
        provide: PG_CONNECTION,
        useValue: mockRepository,
      },{
        provide: ShiftService,
        useValue: mockShiftRepository, 
      },{
        provide: DepartmentService,
        useValue: mockDepartmentRepository,
      }],
    }).compile();

    service = module.get<DashboardService>(PG_CONNECTION);
  });


  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should get data collection for dashboard by manager\'s id.', () => {
    const dto: DashboardCardDto = {
      department: {
        department_id: "1",
        name: "ต้มไก่"
      },
      shifts: [
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
    };

    expect(service.getData('1')).toEqual(dto)
  })
});
