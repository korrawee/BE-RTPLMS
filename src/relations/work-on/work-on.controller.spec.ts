import { Test, TestingModule } from '@nestjs/testing';
import { WorkOnPostDeleteDto } from './dto/WorkOnPostDeleteDto';
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
      return [
        {
          "account_id": "1",
          "fullname": "full-name1"
        }
      ];
    }),
    createWorkOn: jest.fn((mngId:string, date:string)=>{
      return {
        "status": 200,
        "message": "Insert Successful..."
      };
    }),
    deleteWorkOn: jest.fn((mngId:string, date:string)=>{
      return {
        "status": 200,
        "message": "Delete Successful..."
      };
    }),
    getWorkOnOfShift: jest.fn((shiftId: string, date: string)=>{
      return [{
        "account_id": "1",
        "shift_code": "2",
        "checkin_time": null,
        "checkout_time": null,
        "ot": null,
        "date": "2023-01-08T17:00:00.000Z"
      },];
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

  it('should be add worker into shift', async ()=>{
    const body: WorkOnPostDeleteDto = {
      "shiftCode": "1",
      "date": "2023-01-09",
      "accountIds": [
        "1",
        "4",
        "5",
        "8",
        "9"
      ]
    }
    const expectResult = {
      "status": 200,
      "message": "Insert Successful..."
    }
    const result = await controller.createWorkOn(body);
    expect(result).toEqual(expectResult);
    expect(service.createWorkOn).toHaveBeenCalledWith(body);
  })

  it('should be delete worker from shift', async ()=>{
    const body: WorkOnPostDeleteDto = {
      "shiftCode": "1",
      "date": "2023-01-09",
      "accountIds": [
        "1",
        "4",
        "5",
        "8",
        "9"
      ]
    }
    const expectResult = {
      "status": 200,
      "message": "Delete Successful..."
    }
    const result = await controller.deleteWorkOn(body);
    expect(result).toEqual(expectResult);
    expect(service.deleteWorkOn).toHaveBeenCalledWith(body);
  })

  it('should get all work on of given shift',async ()=>{
    const expectResult = [{
      "account_id": "1",
      "shift_code": "2",
      "checkin_time": null,
      "checkout_time": null,
      "ot": null,
      "date": "2023-01-08T17:00:00.000Z"
    },];
    const shiftCode = '2';
    const date = '2023-01-09';

    const result = await controller.getWorkOnOfShift(shiftCode, date);

    expect(result).toEqual(expectResult);
    expect(service.getWorkOnOfShift).toHaveBeenCalledWith(shiftCode, date);
  });
});
