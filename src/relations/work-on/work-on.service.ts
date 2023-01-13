import { Injectable } from '@nestjs/common';
import { InjectClient } from 'nest-postgres';
import { Client } from 'pg';
import { dbResponse } from 'src/db/db.response.type';
import { CreateWorkOnBodyDto } from './dto/CreateWorkOnBody.dto';
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

    public async getFreeWorker(mng_id: string, date: string) {
        const query = `
            WITH
            worker_of_mng1 as (
                SELECT * FROM accounts WHERE mng_id='${mng_id}'
            )
            ,worker_in_shift as (
                SELECT account_id FROM work_on WHERE date='${date}'
            )
            SELECT worker_of_mng1.account_id, worker_of_mng1.fullname 
            FROM worker_of_mng1 
            WHERE worker_of_mng1.account_id NOT IN (SELECT * from worker_in_shift);
        `
        const freeWorkers = this.cnn.query(query)
        .then((res: dbResponse) => {
            return res.rows;
        })
        return freeWorkers;
    }
    public async createWorkOn(body: CreateWorkOnBodyDto){
        const values = body.accountIds.reduce((str: string, accId:string, currentIndex: number)=>{
            return str + (currentIndex == body.accountIds.length-1 ? `('${accId}', '${body.shiftCode}', '${body.date}');` : `('${accId}', '${body.shiftCode}', '${body.date}'),`)    
        },'');

        const query = `INSERT INTO work_on(
            account_id, shift_code, date
            )
            VALUES${values}; 
        `;

        try{
            const res = await this.cnn.query(query);
            return {status: 200, message: "Insert Successful..."};

        }catch(e){
            console.log(e);
            return new Error('Server Error.');
        }
    }
}