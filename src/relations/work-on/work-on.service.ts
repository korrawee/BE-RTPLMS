import { Injectable } from '@nestjs/common';
import { InjectClient } from 'nest-postgres';
import { Client } from 'pg';
import { dbResponse } from 'src/db/db.response.type';
import { WorkOnDto } from './dto/WorkOn.dto';
@Injectable()
export class WorkOnService {
    constructor(@InjectClient() private readonly cnn: Client){}

    public async findAllByShiftId(shiftCode: string){
        const query = `
            SELECT * , 
            CASE
                WHEN checkin_time <= (SELECT shift_time FROM shifts WHERE shift_code='${shiftCode}') THEN 'ปกติ'
                WHEN checkin_time > (SELECT shift_time FROM shifts WHERE shift_code='${shiftCode}') THEN 'สาย'
                WHEN checkin_time IS NULL THEN 'ยังไม่เข้างาน'
                ELSE 'ยังไม่เข้างาน'
            END AS checkin_status
            FROM work_on WHERE shift_code='${shiftCode}';
        `;
        const allWorkOnThisShift: WorkOnDto[] = await this.cnn.query(query)
            .then((res: dbResponse) => {

                return res.rows;
            });
        return allWorkOnThisShift;
    }
}