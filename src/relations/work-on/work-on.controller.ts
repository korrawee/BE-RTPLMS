import { Body, Controller, Delete, Get,Param, Post } from '@nestjs/common';
import { WorkOnPostDeleteDto } from './dto/WorkOnPostDeleteDto';
import { WorkOnService } from './work-on.service';

@Controller('work-on')
export class WorkOnController {
    constructor(private readonly workOnService: WorkOnService){}

    @Get(':mngId/:date')
    async getFreeWorker(@Param('mngId') mngId: string, @Param('date') date: string){
        return this.workOnService.getFreeWorker(mngId, date);
    }

    @Post('')
    async createWorkOn(@Body()  body: WorkOnPostDeleteDto){
        return await this.workOnService.createWorkOn(body);
    }

    @Delete('')
    async deleteWorkOn(@Body() body: WorkOnPostDeleteDto){
        return await this.workOnService.deleteWorkOn(body);
    }

}

