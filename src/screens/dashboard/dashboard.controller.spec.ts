import { Test, TestingModule } from '@nestjs/testing';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

describe('DashboardController', () => {
  let controller: DashboardController;
  const mockDashboardService = {
    getData: jest.fn((mngId: string)=>{
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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DashboardController],
      providers: [DashboardService],
    }).overrideProvider(DashboardService).useValue(mockDashboardService).compile();

    controller = module.get<DashboardController>(DashboardController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should get a data collection for dashboard of a manager\'s id.', () => {

    const managerId = '1';
    const dto = {
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
    expect(controller.getData(managerId)).toEqual(dto);
  
    expect(mockDashboardService.getData).toHaveBeenCalledWith(managerId);
  });
});
