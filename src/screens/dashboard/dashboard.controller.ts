import { Controller, Get, Param, Res } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
@Controller('dashboard')
export class DashboardController {
    constructor(private readonly dashboardService: DashboardService) {}

    @Get('/:mng_id')
    async getData(@Param('mng_id') mngId: string) {
        const data = await this.dashboardService.getData(mngId);
        return data;
    }
}
