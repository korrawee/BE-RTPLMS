import { Test, TestingModule } from '@nestjs/testing';
import { PG_CONNECTION } from '../../constants';
import { DepartmentService } from '../../department/department.service';
import { ShiftService } from '../../shift/shift.service';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

describe('DashboardController', () => {
  let controller: DashboardController;
  let service: DashboardService;

  const mockPG = {}
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DashboardController],
      providers: [DashboardService, ShiftService, DepartmentService, {
        provide: PG_CONNECTION,
        useValue: mockPG,
      }],
    }).compile();

    controller = module.get<DashboardController>(DashboardController);
    service = module.get<DashboardService>(DashboardService);
  });

  describe('getData', () => {
    it('should get a data collection for dashboard of a manager\'s id.', async () => {
      const managerId = '1';
      const expectedResult = {
        department: [
          {
            department_id: "1",
            name: "ต้มไก่"
          },
        ],
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
      jest.spyOn(service, 'getData').mockResolvedValue(expectedResult);

      const result = await controller.getData(managerId);
      expect(result).toEqual(expectedResult);
      expect(service.getData).toHaveBeenCalledWith(managerId);
    });
  });
});
