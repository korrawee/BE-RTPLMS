import { Test, TestingModule } from '@nestjs/testing';
import { getConnectionName } from 'nest-postgres';
import { DepartmentService } from '../../department/department.service';
import { ShiftService } from '../../shift/shift.service';
import { DashboardService } from './dashboard.service';
import { DashboardCardDto } from './dto/dashboardCard.dto';
import { Client } from 'pg';
import { dbResponse } from 'src/db/db.response.type';
import { DepartmentforDashboardDto } from 'src/department/dto/DepartmentforDashboard.dto';
import { ShiftforDashboardDto } from 'src/shift/dto/ShiftForDashboard.dto';


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

describe('DashboardService', () => {
  let dashboardService: DashboardService;
  let departmentService: DepartmentService;
  let shiftService: ShiftService;

  beforeEach(async () => {
    const client: Client = new Client();
    const module: TestingModule = await Test.createTestingModule({
      providers: [DashboardService,ShiftService,DepartmentService,{
        provide: getConnectionName({clientOptions: client}),
        useValue: mClient,
      }],
    }).compile();

    dashboardService = module.get<DashboardService>(DashboardService);
    departmentService = module.get<DepartmentService>(DepartmentService);
    shiftService = module.get<ShiftService>(ShiftService);
  });


  it('should be defined', () => {
    expect(dashboardService).toBeDefined();
  });

  it('should get data collection for dashboard by manager\'s id.', async () => {
    const mockDepartment: DepartmentforDashboardDto[] = [
      {
        department_id: "1",
        name: "ต้มไก่"
      }
    ] 
    const mockShifts: ShiftforDashboardDto[] = [
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
    
    const dto: DashboardCardDto = {
      department: mockDepartment,
      shifts: [...mockShifts]
    };

    const spyOnGetDepartmentsById = jest.spyOn(departmentService, 'getDepartmentsById').mockResolvedValueOnce(mockDepartment);
    const spyOnGetShiftsById = jest.spyOn(shiftService, 'getShiftsById').mockResolvedValueOnce(mockShifts);

    expect(await dashboardService.getData('1')).toEqual(dto)
  })
});
