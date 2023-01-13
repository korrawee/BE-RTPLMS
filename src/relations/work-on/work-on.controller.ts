import { Controller, Get,Param } from '@nestjs/common';
import { WorkOnService } from './work-on.service';

@Controller('work-on')
export class WorkOnController {
    constructor(private readonly workOnService: WorkOnService){}

    @Get(':mngId/:date')
    getFreeWorker(@Param('mngId') mngId: string, @Param('date') date: string){
        return this.workOnService.getFreeWorker(mngId, date);
    }

}

