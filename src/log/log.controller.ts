import { Controller, Delete, Get, Param } from '@nestjs/common';
import { LogService } from './log.service';

@Controller('logs')
export class LogController {
    constructor(private readonly logService: LogService){}

    @Get('managers/:mngId/:date')
    public getAllByIdAndDate(@Param('mngId') mngId: string, @Param('date') date: string) {
        return this.logService.getAllByIdAndDate(mngId, date);
    }
    @Delete(':logId')
    public deleteLogById(@Param('logId') logId: string) {
        return this.logService.deleteLogById(logId);
    }
}
