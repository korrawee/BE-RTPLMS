import { Test, TestingModule } from '@nestjs/testing';
import { CreateOtRequestDto } from './dto/createOtRequest.dto';
import { RequestDto } from './dto/Request.dto';
import { RequestForOtDetailDto } from './dto/RequestForOtDetail.dto';
import { RequestController } from './request.controller';
import { RequestService } from './request.service';
const moment = require('moment');

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

  it('it should create ot request given number of person sort by chcek in time', async ()=>{

    const body: CreateOtRequestDto = {
      shiftCode: "2",
       date: "2023-01-09",
       unit: "person",
       quantity: 3,
       sortBy: "checkin",
       mngId: "1"
   }

   const expectResult: RequestDto[] = [
    {
      shiftCode: '2',
      accountId: '2',
      mngId: '1',
      date: '2023-01-09',
      numberOfHour: 3,
      reqStatus: 'รอดำเนินการ',
      createdAt: moment('2023-01-09 11:40 PM', 'YYYY-MM-DD hh:mm A'),
    }
  ]


    const res = await controller.createOtRequest(body);
    const spyOnCreateOtRequest = jest.spyOn(service,'createOtRequest').mockResolvedValueOnce(expectResult);
    expect(service.createOtRequest).toBeCalledWith(body);
  })

  // it('it should create ot request given number of person with manual selection', ()=>{
  // })

  // it('it should create ot request given number of hour sort by chcek in time')

  // it('it should create ot request given number of hour with manual selection')

  
  // @Post()
  // public async createOtRequest(@Body() body: CreateOtRequestDto){
  //     return await this.reqService.createOtRequest(body);
  // }

  // @Delete()
  // public async deleteOtRequest(@Body() body: DeleteOtRequest) {
  //     return await this.reqService.deleteOtRequest(body);
  // }

});
