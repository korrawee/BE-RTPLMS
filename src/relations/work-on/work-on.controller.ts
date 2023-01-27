import { Body, Controller, Delete, Get,Param, Post } from '@nestjs/common';
import { WorkOnPostDeleteDto } from './dto/WorkOnPostDeleteDto';
import { WorkOnService } from './work-on.service';

@Controller('work-on')
export class WorkOnController {
    constructor(private readonly workOnService: WorkOnService){}

    @Get('/managers/:mngId/shifts/:shiftCode/:date')
    async getFreeWorker(@Param('mngId') mngId: string, @Param('shiftCode') shiftCode: string, @Param('date') date: string){
        return this.workOnService.getFreeWorker(mngId, shiftCode, date);
    }

    @Get('/shift/:shiftId/:date')
    async getWorkOnOfShift(@Param('shiftId') shiftId: string, @Param('date') date: string){
        return this.workOnService.getWorkOnOfShift(shiftId, date);
    }

    @Post('')
    async createWorkOn(@Body() body: WorkOnPostDeleteDto){
        return await this.workOnService.createWorkOn(body);
    }

    @Delete('')
    async deleteWorkOn(@Body() body: WorkOnPostDeleteDto){
        return await this.workOnService.deleteWorkOn(body);
    }

}

