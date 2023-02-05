import { BadRequestException, Injectable } from '@nestjs/common';
import { Client } from 'pg';
import { InjectClient } from 'nest-postgres';
import { dbResponse } from 'src/db/db.response.type';
import { ScheduleDataDto } from './dto/scheduleData.dto';
import { isNumber } from 'class-validator';

@Injectable()
export class ScheduleService {
    constructor(@InjectClient() private readonly cnn: Client){}

    async getScheduleByAccountId(accId : string){

        if(!isNumber(parseInt(accId))) throw new BadRequestException('Invalid account id.')

        const query = `
            WITH
            w as (
                    SELECT * 
                    FROM work_on 
                    where account_id='${accId}'
                    ),
            w_to_s as (
                    SELECT w.*, 
                    CASE
                            WHEN checkin_time <= s.shift_time THEN 'ปกติ'
                            WHEN checkin_time > s.shift_time THEN 'สาย'
                            WHEN checkin_time IS NULL THEN 'ยังไม่เข้างาน'
                            ELSE 'ยังไม่เข้างาน'
                    END AS checkin_status,
                    s.shift_time 
                    FROM shifts AS s 
                    INNER JOIN w 
                    ON s.shift_code=w.shift_code
                    ), 
            s_to_c as (
                    SELECT w_to_s.*, c.department_id 
                    FROM _controls AS c 
                    INNER JOIN w_to_s 
                    ON w_to_s.shift_code=c.shift_code
                    ), 
            s_to_c_to_d as (
                    SELECT s_to_c.*, d.name
                    FROM departments AS d 
                    INNER JOIN s_to_c 
                    ON d.department_id=s_to_c.department_id
                    ),
            s_to_c_to_d_to_r as (
                    SELECT prev.*, r.shift_code, r.number_of_hour, r.date AS ot_date, r.mng_id
                    FROM s_to_c_to_d AS prev
                    LEFT JOIN requests AS r
                    ON prev.account_id=r.account_id AND prev.shift_code=r.shift_code
                    )
            SELECT prev.account_id AS worker_id, prev.name AS department_name, prev.checkin_time, prev.checkout_time, prev.checkin_status, prev.shift_time, prev.number_of_hour AS ot_duration, prev.ot_date, prev.mng_id, a.fullname AS mng_name
            FROM s_to_c_to_d_to_r as prev
            INNER JOIN accounts as a 
            ON a.account_id=prev.account_id;
        `;

        const workerSchedule: ScheduleDataDto[] = await this.cnn.query(query)
            .then((res: dbResponse) => {
                return res.rows;
            })
            .catch((e)=>{
                console.log(e);
                throw new BadRequestException('Invalid input data');
            });
        return workerSchedule;
    }
}
