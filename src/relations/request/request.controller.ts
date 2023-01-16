import { Controller, Get, Injectable, Param, Query } from '@nestjs/common';
import { RequestService } from './request.service';

@Injectable()
@Controller('request')
export class RequestController {
    constructor(private readonly reqService: RequestService){}

    @Get('/shifts/:shiftCode')
    public getAllRequest(@Param('shiftCode') shiftCode: string, @Query('date') date: string){
        return this.reqService.getAllRequestByShiftAndDate(shiftCode, date);
    }

}
