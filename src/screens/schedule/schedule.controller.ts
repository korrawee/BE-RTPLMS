import { Controller, Get, Param } from '@nestjs/common';
import { ScheduleService } from './schedule.service';

@Controller('schedule')
export class ScheduleController {
    constructor(private readonly scheduleService: ScheduleService) {}

    @Get('accounts/:accId/work-schedule')
    public async getWorkSchedule(@Param('accId') accId: string) {
        return await this.scheduleService.getScheduleByAccountId(accId);
    }
    @Get('accounts/:accId/ot-schedule')
    public async getOtScheduleByAccountId(@Param('accId') accId: string) {
        return await this.scheduleService.getOtScheduleByAccountId(accId);
    }
}
