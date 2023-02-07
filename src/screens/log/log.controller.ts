import { Controller, Get, Param } from '@nestjs/common';
import { LogSrceenService } from './log.service';

@Controller('log-screen')
export class LogScreenController {
    constructor(private readonly logService: LogSrceenService) {}

    @Get('managers/:mngId/:date')
    public getDataForLogScreen(@Param('mngId') mngId: string, @Param('date') date: string){
        return this.logService.getDataForLogScreen(mngId, date);
    }
}
