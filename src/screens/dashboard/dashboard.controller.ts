import { Controller, Get, Param, Query, Res } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
@Controller('dashboard')
export class DashboardController {
    constructor(private readonly dashboardService: DashboardService) {}

    @Get('/:mng_id')
    async getData(@Param('mng_id') mngId: string, @Query('limit') limit: string, @Query('currrentPage') currentPage: number) {
        const data = await this.dashboardService.getData(mngId, limit || '*', currentPage || 1);
        return data;
    }
}
