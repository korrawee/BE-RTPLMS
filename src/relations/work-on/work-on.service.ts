import { BadRequestException, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectClient } from 'nest-postgres';
import { Client } from 'pg';
import { dbResponse } from '../../db/db.response.type';
import { WorkOnPostDeleteDto } from './dto/WorkOnPostDeleteDto';
import { WorkOnDto } from './dto/WorkOn.dto';
import { FilteredAccountDto } from '../../relations/work-on/dto/FilteredAccount.dto';
import { CreateLogDto } from '../../log/dto/CreateLog.dto';
import { DepartmentforDashboardDto } from '../../department/dto/DepartmentforDashboard.dto';
import { LogService } from '../../log/log.service';
import { DetailsDto } from '../../log/dto/Details.dto';
import { ShiftService } from '../../shift/shift.service';
import { DepartmentService } from '../../department/department.service';
import { ShiftDto } from '../../shift/dto/Shift.dto';
import { UpdateWorkOnDto } from './dto/UpdateWorkOn.dto';
import { isNumber, isString } from 'class-validator';
@Injectable()
export class WorkOnService {
    constructor(
        @InjectClient() private readonly cnn: Client,
        private readonly shiftService: ShiftService,
        private readonly departmentService: DepartmentService,
        private readonly logService: LogService
    ) {}

    public async findAllByShiftId(shiftCode: string) {
        const query = `
            SELECT * , 
            CASE
                WHEN checkin_time <= (SELECT shift_time FROM shifts WHERE shift_code='${shiftCode}') THEN 'ปกติ'
                WHEN checkin_time > (SELECT shift_time FROM shifts WHERE shift_code='${shiftCode}') THEN 'สาย'
                WHEN checkin_time IS NULL THEN 'ยังไม่เข้างาน'
                ELSE 'ยังไม่เข้างาน'
            END AS checkin_status
            FROM work_on WHERE shift_code='${shiftCode}'
            ORDER BY cast(account_id AS text);
        `;
        const allWorkOnThisShift: WorkOnDto[] = await this.cnn
            .query(query)
            .then((res: dbResponse) => {
                return res.rows;
            })
            .catch((e) => {
                throw new BadRequestException(e.message);
            });
        return allWorkOnThisShift;
    }

    public async getFreeWorker(
        mng_id: string,
        shiftCode: string,
        date: string
    ) {
        // Only return worker on given shift
        const query = `
            WITH
            worker_of_mng as (
                SELECT * FROM accounts WHERE mng_id='${mng_id}'
            )
            ,worker_in_shift as (
                SELECT account_id FROM work_on WHERE shift_code='${shiftCode}'
            )
            SELECT worker_of_mng.account_id, worker_of_mng.fullname, worker_of_mng.performance 
            FROM worker_of_mng 
            WHERE worker_of_mng.account_id NOT IN (SELECT account_id from worker_in_shift);
        `;
        const freeWorkers = this.cnn
            .query(query)
            .then((res: dbResponse) => {
                return res.rows;
            })
            .catch((e) => {
                throw new BadRequestException(e.message);
            });

        return freeWorkers;
    }

    public async getWorkOnOfShift(shiftCode: string, date: string) {
        const query = `SELECT * from work_on
            WHERE shift_code='${shiftCode}' AND date='${date}';
        `;

        const data = this.cnn
            .query(query)
            .then((res: dbResponse) => {
                return res.rows;
            })
            .catch((e) => {
                throw new BadRequestException(e.message);
            });

        return data;
    }

    /* Add worker to shifts */
    public async createWorkOn(body: WorkOnPostDeleteDto) {
        const values = body.accountIds.reduce(
            (str: string, accId: string, currentIndex: number) => {
                return (
                    str +
                    (currentIndex == body.accountIds.length - 1
                        ? `('${accId}', '${body.shiftCode}', '${body.date}');`
                        : `('${accId}', '${body.shiftCode}', '${body.date}'),`)
                );
            },
            ''
        );
        const query = `INSERT INTO work_on(
            account_id, shift_code, date
            )
            VALUES${values}; 
            `;
        const res = await this.cnn
            .query(query)
            .then(async (res: dbResponse) => {
                /* Create log */
                // ==================================================
                // ==================================================
                const shift: ShiftDto = await this.shiftService.getShiftById(
                    body.shiftCode
                );
                const department: DepartmentforDashboardDto =
                    await this.departmentService.getDepartmentById(
                        shift.department_id
                    );

                const logDetail: DetailsDto = {
                    department: department.name,
                    department_id: department.department_id,
                    account_id: body.accountIds,
                };

                const log: CreateLogDto = {
                    mng_id: body.mng_id,
                    action: 'Add Worker',
                    details: logDetail,
                };

                const createLog = await this.logService.createLog(log);
                // ==================================================
                // ==================================================
                return { status: 200, message: 'Insert Successful...' };
            })
            .catch((e) => {
                throw new BadRequestException(e.message);
            });
        return res;
    }

    public async deleteWorkOn(body: WorkOnPostDeleteDto) {
        const values = body.accountIds.reduce((str, accId, currentIndex) => {
            return (
                str +
                (currentIndex == body.accountIds.length - 1
                    ? `'${accId}'`
                    : `'${accId}',`)
            );
        }, '');
        const query = `DELETE FROM work_on 
            WHERE account_id IN (${values}) AND shift_code='${body.shiftCode}';
        `;
        const res = await this.cnn
            .query(query)
            .then(async (res: dbResponse) => {
                // Create log
                // ==================================================
                // ==================================================
                const shift: ShiftDto = await this.shiftService.getShiftById(
                    body.shiftCode
                );
                const department: DepartmentforDashboardDto =
                    await this.departmentService.getDepartmentById(
                        shift.department_id
                    );

                const logDetail: DetailsDto = {
                    department: department.name,
                    department_id: department.department_id,
                    account_id: body.accountIds,
                };
                const log: CreateLogDto = {
                    mng_id: body.mng_id,
                    action: 'Delete Worker',
                    details: logDetail,
                };

                const createLog = await this.logService.createLog(log);
                // ==================================================
                // ==================================================

                return { status: 200, message: 'Delete Successful...' };
            })
            .catch((e) => {
                throw new BadRequestException(e.message);
            });
        return res;
    }

    public async getAccountIdSortByCheckIn(
        shiftId: string,
        quantity?: number
    ): Promise<FilteredAccountDto[]> {
        // validate parameters
        if (!isString(shiftId))
            throw new BadRequestException('shift id must be a string');
        if (!isNumber(quantity))
            throw new BadRequestException('quantity must be a number');

        const query = `SELECT account_id from work_on 
            WHERE shift_code='${shiftId}' 
            ORDER BY checkin_time
            LIMIT ${quantity || '*'};`;

        const queryData: Promise<FilteredAccountDto[]> = await this.cnn
            .query(query)
            .then((res: dbResponse) => {
                const data: FilteredAccountDto[] = res.rows;
                return data;
            })
            .catch((e) => {
                console.error(e);
                return new BadRequestException(e);
            });

        return queryData;
    }

    async update(body: UpdateWorkOnDto) {
        const bodyArr = Object.entries(body);
        const values = bodyArr.reduce((str, val, curIndex) => {
            return (
                str +
                (curIndex == bodyArr.length - 1
                    ? `${val[0]}='${val[1]}'`
                    : `${val[0]}='${val[1]}',`)
            );
        }, '');
        const query = `
            UPDATE work_on
            SET ${values}
            WHERE account_id='${body.account_id}' 
            AND shift_code='${body.shift_code}'
            RETURNING *
        ;`;
        console.log(query);
        const workOn: WorkOnDto = await this.cnn
            .query(query)
            .then((res: dbResponse) => {
                // handle empty result
                if(res.rows.length == 0) throw new BadRequestException('Work on not found')

                const data: WorkOnDto = res.rows.pop();
                return data;
            })
            .catch((e) => {
                return new BadRequestException(e.message);
            });

        return workOn;
    }
    async getOneWorkOn(accId: string, shiftCode: string) {
        const query = `
            SELECT * 
            FROM work_on
            WHERE shift_code='${shiftCode}' AND account_id='${accId}';
        `;

        console.log(query);
        const data = await this.cnn
            .query(query)
            .then((res: dbResponse) => {
                return res.rows.pop();
            })
            .catch((e) => {
                throw new BadRequestException(e.message);
            });

        return data;
    }
}
