import { Body, Controller, Get, Param } from '@nestjs/common';
import { DetailService } from './detail.service';

@Controller('detail')
export class DetailController {
    constructor(private readonly detailService: DetailService) {}

    @Get('/shift/:shift_code')
    public async getData(@Param('shift_code') shiftCode: string) {
        const res = await this.detailService.getData(shiftCode);
        return res;
    }

    @Get('/prediction/:id')
    async getPrediction(@Param('id') shift_code: string) {
        return await this.detailService.getPrediction(shift_code);
    }
}
