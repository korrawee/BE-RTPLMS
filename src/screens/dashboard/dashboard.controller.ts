import { Controller, Get, Param } from '@nestjs/common';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
export class DashboardController {
    constructor(private readonly dashboardService: DashboardService){}

    @Get(':mng_id/:date')
    getData(@Param('mng_id') mngId: string, @Param('date') date: string){
        console.log(date);
        return this.dashboardService.getData(mngId, date);
    }
}