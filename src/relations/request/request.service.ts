import { InjectClient } from 'nest-postgres';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { dbResponse } from '../../db/db.response.type';
import { Client } from 'pg';
import { RequestForOtDetailDto } from './dto/RequestForOtDetail.dto';
import { RequestDto } from './dto/Request.dto';
import { CreateOtRequestDto } from './dto/CreateOtRequest.dto';
import { WorkOnService } from '../work-on/work-on.service';
import { DeleteOtRequest } from './dto/DeleteOtRequest.dto';
import { AccountService } from '../../account/account.service';
import { AccountDto } from '../../account/dto/AccountDto';
import { WorkOnDto } from '../work-on/dto/WorkOn.dto';
import { isNumber } from 'class-validator';
import { UpdateOtRequestDto } from './dto/UpdateOtRequest.dto';
import { LogService } from '../../log/log.service';
import { CreateLogDto } from '../../log/dto/CreateLog.dto';
import { DetailsDto } from '../../log/dto/Details.dto';
import { DepartmentforDashboardDto } from '../../department/dto/DepartmentforDashboard.dto';
import { ShiftService } from '../../shift/shift.service';
import { ShiftDto } from '../../shift/dto/Shift.dto';
import { DepartmentService } from '../../department/department.service';
import { Server } from 'socket.io';

@Injectable()
export class RequestService {
    socketServer: Server;
    constructor(
        @InjectClient()
        private readonly cnn: Client,
        private readonly workOnService: WorkOnService,
        private readonly accountService: AccountService,
        private readonly shiftService: ShiftService,
        private readonly departmentService: DepartmentService,
        private readonly logService: LogService
    ) {}

    public getRequest(shiftCode: string, accountId: string, date: string) {
        const query = `SELECT number_of_hour, req_status 
        FROM requests 
        WHERE shift_code='${shiftCode}' AND 
        account_id='${accountId}' AND 
        date='${date}';
        `;

        return this.cnn
            .query(query)
            .then((res: dbResponse) => {
                return res.rows[0];
            })
            .catch((e) => {
                throw new BadRequestException('Invalid data input');
            });
    }

    public async getAllRequestByShift_id(
        shiftCode: string,
    ): Promise<RequestDto[]> {
        const query = `SELECT * FROM requests WHERE shift_code='${shiftCode}';`;

        const data: RequestDto[] = await this.cnn
            .query(query)
            .then((res: dbResponse) => {
                const resData: RequestDto[] = res.rows;
                return resData;
            })
            .catch((e) => {
                throw new BadRequestException('Invalid Data Input');
            });

        return data;
    }

    public async createOtRequest(body: CreateOtRequestDto) {
        let query: string, values: string;
        let accountIdsLastIndex: number;
        let accounts: AccountDto[] = [];
        let otDurationPerPerson: number;

        switch (body.method) {
            case 'assignByCheckin':
                accounts = await this.workOnService.getAccountIdSortByCheckIn(
                    body.shiftCode,
                    body.quantity
                );
                otDurationPerPerson = await this.getOtDurationPerPersonOfShift(
                    body.shiftCode,
                    accounts
                );

                // Check if ot duration is took too long
                if (otDurationPerPerson > 4) {
                    throw new BadRequestException(
                        'Invalid worker quantity (too many OT hours)'
                    );
                }

                accountIdsLastIndex = accounts?.length - 1;
                values = accounts.reduce((str, account, currentIndex) => {
                    const appendStr = `('${body.shiftCode}','${account.account_id}', '${body.date}', ${otDurationPerPerson}, '${body.mngId}')`;
                    return (
                        str +
                        (accountIdsLastIndex == currentIndex
                            ? appendStr
                            : appendStr + ',')
                    );
                }, '');
                query = `INSERT INTO requests(shift_code, account_id, date, number_of_hour, mng_id) VALUES${values} RETURNING *;`;
                break;

            case 'calHour':
                accounts = await this.accountService.findByIds(body.accountIds);

                otDurationPerPerson = await this.getOtDurationPerPersonOfShift(
                    body.shiftCode,
                    accounts
                );
                const performances = accounts.reduce((performance, accObj) => {
                    return performance + +accObj.performance;
                }, 0);
                // Check if ot duration is took too long

                if (otDurationPerPerson > 4) {
                    throw new BadRequestException(
                        'Invalid worker quantity (too many OT hours)'
                    );
                }

                accountIdsLastIndex = accounts?.length - 1;
                values = accounts.reduce((str, account, currentIndex) => {
                    const appendStr = `('${body.shiftCode}','${account.account_id}', '${body.date}', ${otDurationPerPerson}, '${body.mngId}')`;
                    return (
                        str +
                        (accountIdsLastIndex == currentIndex
                            ? appendStr
                            : appendStr + ',')
                    );
                }, '');
                query = `INSERT INTO requests(shift_code, account_id, date, number_of_hour, mng_id) VALUES${values} RETURNING *;`;

                break;

            case 'assignEveryone':
                const workerInShift: WorkOnDto[] =
                    await this.workOnService.getWorkOnOfShift(
                        body.shiftCode,
                        body.date
                    );
                const workOnLastIndex = workerInShift.length - 1;
                values = workerInShift.reduce((str, workOn, currentIndex) => {
                    const appendStr = `('${body.shiftCode}','${workOn.account_id}', '${body.date}', ${body.quantity}, '${body.mngId}')`;
                    return (
                        str +
                        (workOnLastIndex == currentIndex
                            ? appendStr
                            : appendStr + ',')
                    );
                }, '');
                query = `INSERT INTO requests(shift_code, account_id, date, number_of_hour, mng_id) VALUES${values} RETURNING *;`;
                break;

            case 'assignNormal':
                accountIdsLastIndex = body.accountIds.length - 1;
                values = body.accountIds.reduce(
                    (str, accountId, currentIndex) => {
                        const appendStr = `('${body.shiftCode}','${accountId}', '${body.date}', ${body.quantity}, '${body.mngId}')`;
                        return (
                            str +
                            (accountIdsLastIndex == currentIndex
                                ? appendStr
                                : appendStr + ',')
                        );
                    },
                    ''
                );
                query = `INSERT INTO requests(shift_code, account_id, date, number_of_hour, mng_id) VALUES${values} RETURNING *;`;
                break;

            default:
                accountIdsLastIndex = body.accountIds.length - 1;
                values = body.accountIds.reduce(
                    (str, accountId, currentIndex) => {
                        const appendStr = `('${body.shiftCode}','${accountId}', '${body.date}', ${body.quantity}, '${body.mngId}')`;
                        return (
                            str +
                            (accountIdsLastIndex == currentIndex
                                ? appendStr
                                : appendStr + ',')
                        );
                    },
                    ''
                );
                query = `INSERT INTO requests(shift_code, account_id, date, number_of_hour, mng_id) VALUES${values} RETURNING *;`;
                break;
        }

        const data: Promise<RequestDto[]> = await this.cnn
            .query(query)
            .then(async (res: dbResponse) => {
                const resResult: RequestDto[] = res.rows;
                console.log('request', resResult)
                // Trigger update on frontend
                // To manager
                this.sendNoticeToClient(body.mngId);
                // To worker
                body.accountIds.forEach((id)=>{
                    this.sendNoticeToClient(id);
                });

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
                    mng_id: body.mngId,
                    action: 'Add OT',
                    details: logDetail,
                };

                const createLog = await this.logService.createLog(log);
                // ==================================================
                // ==================================================
                return resResult;
            })
            .catch((e) => {
                throw new BadRequestException('Invalid data input');
            });
        return data;
    }

    public async deleteOtRequest(body: DeleteOtRequest) {
        const accountIdsLastIndex = body.accountIds.length - 1;
        const values = body.accountIds.reduce(
            (str, accountId, currentIndex) => {
                const appendStr = `'${accountId}'`;
                return (
                    str +
                    (accountIdsLastIndex == currentIndex
                        ? appendStr
                        : appendStr + ',')
                );
            },
            ''
        );
        const query = `
            DELETE FROM requests 
            WHERE account_id IN (${values})
            AND shift_code='${body.shiftCode}';
        `;

        const res = await this.cnn
            .query(query)
            .then(async (res: dbResponse) => {

                // Trigger update on frontend
                // To manager
                this.sendNoticeToClient(body.mngId);
                // To worker
                body.accountIds.forEach((id)=>{
                    this.sendNoticeToClient(id);
                });
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
                    mng_id: body.mngId,
                    action: 'Delete OT',
                    details: logDetail,
                };

                const createLog = await this.logService.createLog(log);
                // ==================================================
                // ==================================================
                return res.rows;;
            })
            .catch((e) => {
                throw new BadRequestException('Invalid data input');
            });
        return res
    }

    private async getOtDurationPerPersonOfShift(
        shiftCode: string,
        accounts: AccountDto[]
    ): Promise<number> {
        const accountLastIndex = accounts.length - 1;
        const productRemainQuery = `
            SELECT product_target - success_product AS product_remain 
            FROM shifts 
            WHERE shift_code='${shiftCode}';
        `;

        const values = accounts.reduce((str, account, currentIndex) => {
            return (
                str +
                (accountLastIndex == currentIndex
                    ? `\'${account.account_id}\'`
                    : `\'${account.account_id}\',`)
            );
        }, '');
        const sumPerformanceQuery = `
            SELECT sum(performance)
            FROM accounts
            WHERE account_id IN(${values})
        `;

        const productRemain: number = await this.cnn
            .query(productRemainQuery)
            .then((res: dbResponse) => {
                const resResult: { product_remain: string } = res.rows.pop();
                return resResult.product_remain;
            })
            .catch((e) => {
                throw new BadRequestException('Invalid data input');
            });

        const sumPerformance: number = await this.cnn
            .query(sumPerformanceQuery)
            .then((res: dbResponse) => {
                const resResult: { sum: string } = res.rows.pop();
                return resResult.sum;
            })
            .catch((e) => {
                throw new BadRequestException('Invalid data input');
            });

        // calulate needed ot duration
        const otDurationPerPerson: number = Math.round(
            productRemain / sumPerformance
        );
        return otDurationPerPerson;
    }

    public async getRequestByAccountId(accId: string) {
        // if (!isNumber(parseInt(accId)))
        //     throw new BadRequestException('Invalid account id');

        const query = `
            SELECT shift_code, date, number_of_hour, req_status, create_at 
            FROM requests
            WHERE account_id='${accId}'
            ORDER BY create_at DESC;
        `;

        const requests: RequestDto[] = await this.cnn
            .query(query)
            .then((res: dbResponse) => {
                return res.rows;
            })
            .catch((e) => {
                throw new BadRequestException('Invalid data input');
            });

        return requests;
    }

    public async updateRequestByShiftCodeAndAccountId(
        body: UpdateOtRequestDto
    ) {
        const { shift_code, account_id } = body;
        delete body.account_id;
        delete body.shift_code;

        const columns = Object.keys(body);
        const valueArray = Object.values(body);

        const valuesLastIndex = valueArray.length - 1;

        const values = valueArray.reduce((str, v, currentIndex) => {
            const value = typeof v === 'string' ? `'${v}'` : `${v}`;
            return (
                str + (currentIndex == valuesLastIndex ? value : value + ',')
            );
        }, '');

        let query: string;
        // Update one request
        if (columns.length == 1 && valueArray.length == 1) {
            query = `
                UPDATE requests
                SET ${columns} = ${values}
                WHERE shift_code='${shift_code}' AND account_id='${account_id}'
                RETURNING *
                ;
            `;
        } else {
            // Update many requests
            query = `
                UPDATE requests
                SET (${columns}) = (${values})
                WHERE shift_code='${shift_code}' AND account_id='${account_id}'
                RETURNING *;
            `;
        }
        // query to check if shift_code and account id exists
        console.log(query)
        const result = await this.cnn
            .query(query)
            .then((res: dbResponse) => {
                // Trigger update on frontend
                // To manager
                const data  = res.rows.pop();
                this.sendNoticeToClient(data.mng_id);
                // To worker
                this.sendNoticeToClient(data.account_id);

                return {
                    message: `Updated ot request of account number ${account_id} for shift number ${shift_code}.`,
                };
            })
            .catch((e) => {
                throw new BadRequestException(e.message);
            });
        return result;
    }

    private sendNoticeToClient(target: string) {
        const topic = `${target}-request`;
        console.log('topic: ', topic)
        return this.socketServer.emit(topic,{isUpdate: true});
    }
}
