import { Injectable } from '@nestjs/common';
import { LogService } from '../../log/log.service';

@Injectable()
export class LogSrceenService {
    constructor(private readonly logService: LogService) {}

    public async getDataForLogScreen(mngId: string, date: string) {
        const result = await this.logService.getAllByIdAndDate(mngId, date);
        return result;
    }
}
