import { Injectable } from '@nestjs/common';
import { RequestService } from '../../relations/request/request.service';
import { AccountService } from '../../account/account.service';
import { AccountDto } from '../../account/dto/AccountDto';
import { WorkOnDto } from '../../relations/work-on/dto/WorkOn.dto';
import { WorkOnService } from '../../relations/work-on/work-on.service';
import { PersonDetailDto } from './dto/PersonDetail.dto';
const moment = require('moment');

@Injectable()
export class DetailService {
    constructor(
        private readonly accountService: AccountService,
        private readonly workOnService: WorkOnService,
        private readonly requestService: RequestService
    ) {}

    public async getData(shiftCode: string) {
        const workOnThisShift: WorkOnDto[] =
            await this.workOnService.findAllByShiftId(shiftCode);

        const accountIds: Array<string> = workOnThisShift.map(
            (obj: WorkOnDto) => obj.account_id
        );
        const accountOnThisShift: AccountDto[] =
            await this.accountService.findByIds(accountIds);

        if (workOnThisShift.length != accountOnThisShift.length) {
            throw new Error('account and workOn length not match.');
        }

        const response: PersonDetailDto[] = [];

        for (const [index, workOn] of workOnThisShift.entries()) {
            const workOnDate = moment(new Date(workOn.date)).format(
                'YYYY-MM-DD'
            );
            const request: { req_status: string; number_of_hour: number } =
                await this.requestService.getRequest(
                    workOn.shift_code,
                    workOn.account_id,
                    workOnDate
                );

            const person: PersonDetailDto = {
                id: accountOnThisShift[index].account_id,
                name: accountOnThisShift[index].fullname,
                performance: accountOnThisShift[index].performance,
                checkInTime:
                    workOn.checkin_time == null ? '' : workOn.checkin_time,
                checkOutTime:
                    workOn.checkout_time == null ? '' : workOn.checkout_time,
                checkInStatus: workOn.checkin_status,
                otStatus: request?.req_status,
                otDuration: request?.number_of_hour,
            };

            response.push(person);
        }

        return response;
    }
}
