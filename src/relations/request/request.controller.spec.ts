import { Test, TestingModule } from '@nestjs/testing';
import { serialize } from 'v8';
import { RequestForOtDetailDto } from './dto/RequestForOtDetail.dto';
import { RequestController } from './request.controller';
import { RequestService } from './request.service';

describe('RequestController', () => {
  let controller: RequestController;
  let service: RequestService;

  const mockRequestSerivce = {
    getAllRequestByShiftAndDate: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RequestController],
      providers: [RequestService]
    }).overrideProvider(RequestService).useValue(mockRequestSerivce).compile();

    controller = module.get<RequestController>(RequestController);
    service = module.get<RequestService>(RequestService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should get all request by given shiftCode and date', async ()=>{
    const shiftCode = '1';
    const date = '2023-01-09';
    const expectResult: RequestForOtDetailDto[] = [
      {
        shiftCode: '1',
        accountId: '1',
        accountName: 'full-name',
        numberOfHour: 4,
        reqStatus: 'รอดำเนินการ'
      },
    ];


    const res = await controller.getAllRequest(shiftCode, date);
    const spyOnGetAllRequestByShiftAndDate = jest.spyOn(service,'getAllRequestByShiftAndDate').mockResolvedValueOnce(expectResult);
    expect(service.getAllRequestByShiftAndDate).toBeCalledWith(shiftCode, date);
  });

});
