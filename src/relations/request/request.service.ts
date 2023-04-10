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
import { isDate, isNumber, isString } from 'class-validator';
import { UpdateOtRequestDto } from './dto/UpdateOtRequest.dto';
import { LogService } from '../../log/log.service';
import { CreateLogDto } from '../../log/dto/CreateLog.dto';
import { DetailsDto } from '../../log/dto/Details.dto';
import { DepartmentforDashboardDto } from '../../department/dto/DepartmentforDashboard.dto';
import { ShiftService } from '../../shift/shift.service';
import { ShiftDto } from '../../shift/dto/Shift.dto';
import { DepartmentService } from '../../department/department.service';
import { Server } from 'socket.io';
import moment = require('moment');

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
        shiftCode: string
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

        // validate body
        if (
            !isNumber(body.quantity) &&
            body.method != 'manual_select_worker' &&
            body.method != 'assignEveryone'
        )
            throw new BadRequestException('quantity must be an integer');
        if (!isDate(new Date(body.date)))
            throw new BadRequestException('wrong date format');

        switch (body.method) {
            case 'assignByCheckin':
                switch (body.unit) {
                    case 'hour':
                        // find all worker in shift
                        const allAccounts: AccountDto[] =
                            await this.workOnService.getAccountIdSortByCheckIn(
                                body.shiftCode
                            );

                        // calculate minimun worker to meet given ot duration
                        for (let i = 1; i <= allAccounts.length; i++) {
                            const selectedAccount: AccountDto[] =
                                allAccounts.slice(0, i);
                            const otDurationPerPerson =
                                await this.getOtDurationPerPersonOfShift(
                                    body.shiftCode,
                                    selectedAccount
                                );
                            if (otDurationPerPerson.duration <= body.quantity) {
                                accounts = [...selectedAccount];
                                break;
                            }
                        }
                        throw new BadRequestException(
                            `insufficient OT duration (${body.quantity} hr.)`
                        );

                    case 'person':
                        accounts =
                            await this.workOnService.getAccountIdSortByCheckIn(
                                body.shiftCode,
                                body.quantity
                            );

                        // handle empty worker in shift
                        if (accounts.length == 0)
                            throw new BadRequestException('no worker in shift');

                        otDurationPerPerson =
                            await this.getOtDurationPerPersonOfShift(
                                body.shiftCode,
                                accounts
                            ).then((res)=>res.duration);
                        break;
                    default:
                        throw new BadRequestException(`no unit ${body.unit}`);
                }

                // Check if ot duration is took too long
                if (otDurationPerPerson > 4 || otDurationPerPerson < 0) {
                    throw new BadRequestException(
                        `Too many OT hours(${`${Math.floor(otDurationPerPerson)} ชม. ${((otDurationPerPerson-Math.floor(otDurationPerPerson))*60).toFixed(0)} นาที`} hr.). Please select more workers`
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

            case 'manual_select_worker':
                accounts = await this.accountService.findByIds(body.accountIds);

                // handle empty worker in shift
                if (accounts.length == 0)
                    throw new BadRequestException('no worker in shift');

                accountIdsLastIndex = accounts?.length - 1;
                otDurationPerPerson = await this.getOtDurationPerPersonOfShift(
                    body.shiftCode,
                    accounts
                ).then((res)=>res.duration);

                // Check if ot duration is took too long
                if (otDurationPerPerson > 4 || otDurationPerPerson < 0) {
                    throw new BadRequestException(
                        `Too many OT hours(${`${Math.floor(otDurationPerPerson)} ชม. ${((otDurationPerPerson-Math.floor(otDurationPerPerson))*60).toFixed(0)} นาที`} hr. / worker). Please select more workers`
                    );
                }

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
                accounts = await this.accountService.findByIds(body.accountIds);

                // handle empty worker in shift
                if (accounts.length == 0)
                    throw new BadRequestException('no worker in shift');

                accountIdsLastIndex = accounts?.length - 1;
                otDurationPerPerson = await this.getOtDurationPerPersonOfShift(
                    body.shiftCode,
                    accounts
                ).then((res)=>res.duration);

                // Check if ot duration is took too long
                if (otDurationPerPerson > 4 || otDurationPerPerson < 0) {
                    throw new BadRequestException(
                        `Too many OT hours(${`${Math.floor(otDurationPerPerson)} ชม. ${((otDurationPerPerson-Math.floor(otDurationPerPerson))*60).toFixed(0)} นาที`}} hr. / worker). Please select more workers`
                    );
                }
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

            case 'manual':
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
                throw new BadRequestException(`No method ${body.method}`);
        }

        const data: Promise<RequestDto[]> = await this.cnn
            .query(query)
            .then(async (res: dbResponse) => {
                const resResult: RequestDto[] = res.rows;
                // Trigger update on frontend
                // To manager
                this.sendNoticeToClient(body.mngId);
                // To worker
                body.accountIds.forEach((id) => {
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
                console.error(e);
                throw new BadRequestException(e.message);
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
                body.accountIds.forEach((id) => {
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
                return res.rows;
            })
            .catch((e) => {
                throw new BadRequestException('Invalid data input');
            });
        return res;
    }

    public async getOtDurationPerPersonOfShift(
        shiftCode: string,
        accounts: AccountDto[]
    ){
        // validate parameter
        if (!isString(shiftCode))
            throw new BadRequestException('shift code must be string');

        const accountLastIndex = accounts.length - 1;

        //get shift details
        const shift = await this.shiftService.getShiftById(shiftCode);
        const request_list = await this.getAllRequestByShift_id(shiftCode);
        const shift_OT_time =
            request_list.filter((req) => req.req_status === 'ยอมรับ').length !=
            0
                ? Math.max(
                      ...request_list
                          .filter((req) => req.req_status === 'ยอมรับ')
                          .map((req) => req.number_of_hour)
                  )
                : 0;
        const shift_start_time = moment(
            `${moment(shift.date).format('YYYY-MM-DD')} ${shift.shift_time}`,
            'YYYY-MM-DD HH:mm:ss'
        );
        const shift_plan_end_time = moment(
            `${moment(shift.date).format('YYYY-MM-DD')} ${shift.shift_time}`,
            'YYYY-MM-DD HH:mm:ss'
        ).add(8, 'hours');
        const shift_OT_end_time = moment(
            `${moment(shift.date).format('YYYY-MM-DD')} ${shift.shift_time}`,
            'YYYY-MM-DD HH:mm:ss'
        ).add(8 + shift_OT_time, 'hours');

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

        const productRemain = async (): Promise<number> => {
            if (moment().isBefore(shift_OT_end_time)) {
                //Prediction OT product from ideal performance of OT plan
                const ideal_OT_predict_product = await Promise.all(
                    request_list.map(async (req_data) => {
                        if (req_data.req_status == 'ยอมรับ') {
                            const performance =
                                await this.accountService.getPerformanceByID(
                                    req_data.account_id
                                );
                            return (
                                parseFloat(performance) *
                                req_data.number_of_hour
                            );
                        } else {
                            return 0;
                        }
                    })
                ).then((products) =>
                    products.reduce((sum, product) => sum + product, 0)
                );

                //check shift started?
                if (moment().isBefore(shift_start_time)) {
                    const predict_product_in_shift_time =
                        parseFloat(shift.ideal_performance) * 8;
                    return (
                        parseFloat(shift.product_target) -
                        (predict_product_in_shift_time +
                            ideal_OT_predict_product)
                    );
                } else {
                    //if started
                    //Check on shift_time case or on OT_time case
                    if (moment().isBefore(shift_plan_end_time)) {
                        //if on shift_time case
                        const remainint_time = moment
                            .duration(shift_plan_end_time.diff(moment()))
                            .asHours();
                        return (
                            parseFloat(shift.product_target) -
                            (parseFloat(shift.success_product_in_shift_time) +
                                remainint_time * shift.actual_performance +
                                ideal_OT_predict_product)
                        );
                    } else {
                        //if on OT time case
                        const remainint_time = moment
                            .duration(shift_OT_end_time.diff(moment()))
                            .asHours();
                        return (
                            parseFloat(shift.product_target) -
                            (parseFloat(shift.success_product_in_shift_time) +
                                parseFloat(shift.success_product_in_OT_time) +
                                remainint_time * shift.actual_performance)
                        );
                    }
                }
            } else {
                throw new BadRequestException('Shift finished');
            }
        };

        const sumPerformance: number = await this.cnn
            .query(sumPerformanceQuery)
            .then((res: dbResponse) => {
                if (res.rows.length == 0)
                    throw new BadRequestException('No sum of performances');
                const resResult: { sum: string } = res.rows.pop();
                return resResult.sum;
            })
            .catch((e) => {
                console.error(e);
                throw new BadRequestException(e.message);
            });

         // calulate needed ot duration
        return {duration: (await productRemain()) / sumPerformance}
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
        const result = await this.cnn
            .query(query)
            .then((res: dbResponse) => {
                // Trigger update on frontend
                // To manager
                const data = res.rows.pop();
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
        console.log('topic: ', topic);
        return this.socketServer.emit(topic, { isUpdate: true });
    }
}
