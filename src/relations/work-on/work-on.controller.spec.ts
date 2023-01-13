import { Test, TestingModule } from '@nestjs/testing';
import { WorkOnController } from './work-on.controller';
import { WorkOnService } from './work-on.service';

describe('WorkOnController', () => {
  let controller: WorkOnController;
  let service: WorkOnService;

  const mockWorkOnService = {
    findAllByShiftId: jest.fn((shiftCode: string)=>{
      return [
        {
          "name": "full-name2",
          "checkInTime": "07:00:00",
          "checkOutTime": "-",
          "checkInStatus": "ปกติ"
        }
      ]
    }),
    getFreeWorker: jest.fn((mngId:string, date:string)=>{
      return ''
    })
  }
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WorkOnController],
      providers: [WorkOnService]
    }).overrideProvider(WorkOnService).useValue(mockWorkOnService).compile();

    controller = module.get<WorkOnController>(WorkOnController);
    service = module.get<WorkOnService>(WorkOnService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should get free work when provides managerId and date', async () => {

    const expectResult = [
      {
        "account_id": "1",
        "fullname": "full-name1"
      },
      {
        "account_id": "4",
        "fullname": "full-name4"
      },
      {
        "account_id": "5",
        "fullname": "full-name5"
      },
      {
        "account_id": "8",
        "fullname": "full-name8"
      },
      {
        "account_id": "9",
        "fullname": "full-name9"
      }
    ]
    jest.spyOn(service, 'getFreeWorker').mockResolvedValueOnce(expectResult);
    const result = await controller.getFreeWorker('1','2023-01-09');
    expect(result).toEqual(expectResult);
    expect(service.getFreeWorker).toHaveBeenCalledWith('1','2023-01-09');
  })
});
