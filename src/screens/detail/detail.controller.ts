import { Body, Controller, Get, Param } from '@nestjs/common';
import { DetailService } from './detail.service';

@Controller('detail')
export class DetailController {
    constructor(private readonly detailService: DetailService){}

    @Get('/shift/:shift_code')
    getData(@Param('shift_code') shiftCode: string){
        return this.detailService.getData(shiftCode);
    }
}
