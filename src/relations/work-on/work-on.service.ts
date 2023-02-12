import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectClient } from 'nest-postgres';
import { Client } from 'pg';
import { dbResponse } from 'src/db/db.response.type';
import { WorkOnPostDeleteDto } from './dto/WorkOnPostDeleteDto';
import { WorkOnDto } from './dto/WorkOn.dto';
import { FilteredAccountDto } from 'src/relations/work-on/dto/FilteredAccount.dto';
import { CreateLogDto } from 'src/log/dto/CreateLog.dto';
import { DepartmentforDashboardDto } from 'src/department/dto/DepartmentforDashboard.dto';
import { ControlService } from '../control/control.service';
import { LogService } from 'src/log/log.service';
import { DetailsDto } from 'src/log/dto/details.dto';
@Injectable()
export class WorkOnService {
    constructor(
        @InjectClient() private readonly cnn: Client,
        private readonly controlService: ControlService,
        private readonly logService: LogService,
    ){}

    public async findAllByShiftId(shiftCode: string){
        const query = `
            SELECT * , 
            CASE
                WHEN checkin_time <= (SELECT shift_time FROM shifts WHERE shift_code='${shiftCode}') THEN 'ปกติ'
                WHEN checkin_time > (SELECT shift_time FROM shifts WHERE shift_code='${shiftCode}') THEN 'สาย'
                WHEN checkin_time IS NULL THEN 'ยังไม่เข้างาน'
                ELSE 'ยังไม่เข้างาน'
            END AS checkin_status
            FROM work_on WHERE shift_code='${shiftCode}'
            ORDER BY cast(account_id AS int);
        `;
        const allWorkOnThisShift: WorkOnDto[] = await this.cnn.query(query)
            .then((res: dbResponse) => {

                return res.rows;
            })
            .catch((e)=>{
                console.log(e);
                throw new BadRequestException('Invalid input data');
            });
    ; 
        return allWorkOnThisShift;
    }

    public async getFreeWorker(mng_id: string, shiftCode: string, date: string) {
        // Only return worker on given shift
        const query = `
            WITH
            worker_of_mng as (
                SELECT * FROM accounts WHERE mng_id='${mng_id}'
            )
            ,worker_in_shift as (
                SELECT account_id FROM work_on WHERE shift_code='${shiftCode}' AND date='${date}'
            )
            SELECT worker_of_mng.account_id, worker_of_mng.fullname, worker_of_mng.performance 
            FROM worker_of_mng 
            WHERE worker_of_mng.account_id IN (SELECT account_id from worker_in_shift);
        `
        const freeWorkers = this.cnn.query(query)
        .then((res: dbResponse) => {
            return res.rows;
        })
        .catch((e)=>{
            console.log(e);
            throw new BadRequestException('Invalid input data');
        });

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

    /* Add worker to shifts */
    public async createWorkOn(body: WorkOnPostDeleteDto){
        const values = body.accountIds.reduce((str: string, accId:string, currentIndex: number)=>{
            return str + (currentIndex == body.accountIds.length-1 ? `('${accId}', '${body.shiftCode}', '${body.date}');` : `('${accId}', '${body.shiftCode}', '${body.date}'),`)    
        },'');
        const query = `INSERT INTO work_on(
            account_id, shift_code, date
            )
            VALUES${values}; 
            `;
        const res = await this.cnn.query(query)
            .then((res: dbResponse)=>{
                console.log("Insert work_on successfully.")
                return {status: 200, message: "Insert Successful..."};
            })
            .then(async ()=>{
                /* Create log */
                // ==================================================
                // ==================================================
                const department = await this.controlService.getDepartmentInfoByShiftId(body.shiftCode);
                const logDetail: DetailsDto = {
                    department: department.name,
                    department_id: department.department_id,
                    account_id: body.accountIds
                }
                const log: CreateLogDto = {
                    mng_id: body.mngId,
                    action: "Add Worker",
                    details: logDetail
                }
                const createLog = await this.logService.createLog(log)
                // ==================================================
                // ==================================================
                    
            })
            .catch(e=>{
                console.log(e);
                throw new BadRequestException('Invalid input data');
            });
        return res;
    }

    public async deleteWorkOn(body: WorkOnPostDeleteDto){
        const values = body.accountIds.reduce((str, accId, currentIndex)=>{
            return str + (currentIndex == body.accountIds.length-1 ?  `'${accId}'`:`'${accId}',`);
        },'');
    
        const query = `DELETE FROM work_on 
            WHERE account_id IN (${values}) AND shift_code='${body.shiftCode}';
        ;`;
        const res = await this.cnn.query(query)
            .then((res: dbResponse)=>{
                return {status: 200, message: "Delete Successful..."};
            })
            .then(async () => {
                /* Create log */
                // ==================================================
                // ==================================================
                const department: DepartmentforDashboardDto = await this.controlService.getDepartmentInfoByShiftId(body.shiftCode);
                const logDetail: DetailsDto = {
                    department: department.name,
                    department_id: department.department_id,
                    account_id: body.accountIds
                }
                const log: CreateLogDto = {
                    mng_id: body.mngId,
                    action: "Delete Worker",
                    details: logDetail
                }

                const createLog = await this.logService.createLog(log)
                // ==================================================
                // ==================================================
            })
            .catch(e=>{
                console.log(e);
                throw new BadRequestException('Invalid input data');
            });

    }

    public async getAccountIdSortByCheckIn(shiftId: string, quantity: number): Promise<FilteredAccountDto[]> {

        const query = `SELECT account_id from work_on 
            WHERE shift_code='${shiftId}' 
            ORDER BY checkin_time
            LIMIT ${quantity};`;
        
        
        const queryData: Promise<FilteredAccountDto[]> = await this.cnn.query(query)
            .then((res: dbResponse)=>{
                const data: FilteredAccountDto[] = res.rows;
                return data;
            })
            .catch((e)=>{
                console.log(e);
                return new BadRequestException('Invalid data input');
            });
            
        return queryData;
    }
}