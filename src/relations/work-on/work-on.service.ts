import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectClient } from 'nest-postgres';
import { Client } from 'pg';
import { dbResponse } from 'src/db/db.response.type';
import { WorkOnPostDeleteDto } from './dto/WorkOnPostDeleteDto';
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
            worker_of_mng as (
                SELECT * FROM accounts WHERE mng_id='${mng_id}'
            )
            ,worker_in_shift as (
                SELECT account_id FROM work_on WHERE date='${date}'
            )
            SELECT worker_of_mng.account_id, worker_of_mng.fullname, worker_of_mng.performance 
            FROM worker_of_mng 
            WHERE worker_of_mng.account_id NOT IN (SELECT * from worker_in_shift);
        `
        const freeWorkers = this.cnn.query(query)
        .then((res: dbResponse) => {
            return res.rows;
        })
        return freeWorkers;
    }

    public async getWorkOnOfShift(shiftCode: string, date: string) {
        const query = `SELECT * from work_on
            WHERE shift_code='${shiftCode}' AND date='${date}';
        `;

        const data = this.cnn.query(query)
        .then((res: dbResponse)=>{
            return res.rows;
        })
        .catch((e)=>{
            console.log(e);
            throw new BadRequestException('Invalid input data');
        });

        return data;
    }

    public async createWorkOn(body: WorkOnPostDeleteDto){
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
            throw new BadRequestException('Invalid input data');
        }
    }

    public async deleteWorkOn(body: WorkOnPostDeleteDto){
        const values = body.accountIds.reduce((str, accId, currentIndex)=>{
            return str + (currentIndex == body.accountIds.length-1 ?  `'${accId}'`:`'${accId}',`);
        },'');
    
        const query = `DELETE FROM work_on 
            WHERE account_id IN (${values}) AND shift_code='${body.shiftCode}';
        ;`;

        try{
            const res = await this.cnn.query(query);
            return {status: 200, message: "Delete Successful..."};

        }catch(e){
            console.log(e);
            throw new BadRequestException('Invalid input data');
        }
    }
}