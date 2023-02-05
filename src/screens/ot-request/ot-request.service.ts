import { Injectable } from '@nestjs/common';
import { RequestDto } from 'src/relations/request/dto/Request.dto';
import { RequestService } from 'src/relations/request/request.service';
import { ShiftService } from 'src/shift/shift.service';
const moment = require('moment');

@Injectable()
export class OtRequestService {
    constructor(
        private readonly requestService: RequestService,
        private readonly shiftService: ShiftService
    ){}

    public async getOtRequest(accId: string){
        const requestOfAccount: RequestDto[] = await this.requestService.getRequestByAccountId(accId);
        
        const requestWithWorkTime = await Promise.all(requestOfAccount.map(async (reqObj: RequestDto)=>{
            
            return await this.getWorkTime(reqObj);
        }));
        
        return requestWithWorkTime;
    }

    private async getWorkTime(reqObj: RequestDto){
        const shiftTimeObj: {shift_time: string} = await this.shiftService.getShiftTimeById(reqObj.shift_code);
            
        // end time of shift = start time of OT then start time of OT = shift's start time plus 8
        const startTime = moment
            (shiftTimeObj.shift_time, 'HH:mm:ss')
            .add(8, 'hours')
            .format('hh:mm');
        
        const endTime = moment
            .utc(startTime, 'HH:mm')
            .add(reqObj.number_of_hour, 'hours')
            .format('HH:mm');

        const workTime = `${startTime}-${endTime}`;

        return {...reqObj, workTime}
    }
}
