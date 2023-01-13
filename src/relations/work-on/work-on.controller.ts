import { Body, Controller, Get,Param, Post } from '@nestjs/common';
import { CreateWorkOnBodyDto } from './dto/CreateWorkOnBody.dto';
import { WorkOnService } from './work-on.service';

@Controller('work-on')
export class WorkOnController {
    constructor(private readonly workOnService: WorkOnService){}

    @Get(':mngId/:date')
    getFreeWorker(@Param('mngId') mngId: string, @Param('date') date: string){
        return this.workOnService.getFreeWorker(mngId, date);
    }

    @Post('')
    createWorkOn(@Body()  body: CreateWorkOnBodyDto){
        return this.workOnService.createWorkOn(body);
    }

}

