import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { InjectClient } from 'nest-postgres';
import { dbResponse } from 'src/db/db.response.type';
import { Client } from 'pg';
import { RequestForOtDetailDto } from './dto/RequestForOtDetail.dto';
import { RequestDto } from './dto/Request.dto';
import { CreateOtRequestDto } from './dto/createOtRequest.dto';
import { WorkOnService } from '../work-on/work-on.service';
import { DeleteOtRequest } from './dto/DeleteOtRequest.dto';
import { AccountService } from 'src/account/account.service';
import { AccountDto } from 'src/account/dto/AccountDto';
import { WorkOnDto } from '../work-on/dto/WorkOn.dto';
import { isNumber } from 'class-validator';

@Injectable()
export class RequestService {
    constructor(
        @InjectClient() 
        private readonly cnn: Client,
        private readonly workOnService: WorkOnService,
        private readonly accountService: AccountService,
    ){}

    public getRequest(shiftCode: string, accountId: string, date: string){
        const query = `SELECT number_of_hour, req_status 
        FROM requests 
        WHERE shift_code='${shiftCode}' AND 
        account_id='${accountId}' AND 
        date='${date}';
        `;

        return this.cnn.query(query)
            .then((res: dbResponse) => {

                return res.rows[0];
            }).catch((e)=>{
                console.log(e);
                throw new BadRequestException('Invalid data input');
            });
    }

    public async getAllRequestByShiftAndDate(shiftCode: string, date: string): Promise<RequestForOtDetailDto[]>{

        const query = `SELECT * FROM requests WHERE shift_code='${shiftCode}' AND date='${date}';`;

        const data: RequestForOtDetailDto[] = await this.cnn.query(query)
            .then((res: dbResponse)=>{
                const resData: RequestForOtDetailDto[] = res.rows;
                return resData;
            })
            .catch((e)=>{
                console.log(e);
                throw new BadRequestException('Invalid Data Input');
            });

        return data;
    }

    public async createOtRequest(body: CreateOtRequestDto) {
        let query: string, values: string;
        let accountIdsLastIndex: number;
        let accounts: AccountDto[] = [];
        let otDurationPerPerson: number ;

        switch (body.method) {
            case 'assignByCheckin':
                accounts = await this.workOnService.getAccountIdSortByCheckIn(body.shiftCode, body.quantity);
                otDurationPerPerson = await this.getOtDurationPerPersonOfShift(body.shiftCode, accounts);

                // Check if ot duration is took too long
                if(otDurationPerPerson > 4){ 
                    throw new BadRequestException('Invalid worker quantity')
                }

                accountIdsLastIndex = accounts?.length - 1;
                values = accounts.reduce((str, account, currentIndex) => {
                    const appendStr = `('${body.shiftCode}','${account.account_id}', '${body.date}', ${otDurationPerPerson}, '${body.mngId}')`;
                    return str + (accountIdsLastIndex == currentIndex ? appendStr: appendStr + ',');
                },'');
                query = `INSERT INTO requests(shift_code, account_id, date, number_of_hour, mng_id) VALUES${values};`;
                break;

            case 'calHour':
                accounts = await this.accountService.findByIds(body.accountIds);
                
                otDurationPerPerson = await this.getOtDurationPerPersonOfShift(body.shiftCode, accounts);
                const performances = accounts.reduce((performance, accObj)=>{
                    console.log(typeof(accObj.performance));
                    return performance + +accObj.performance;
                },0)
                // Check if ot duration is took too long
                console.log(accounts, otDurationPerPerson, performances);
                if(otDurationPerPerson > 4){ 
                    throw new BadRequestException('Invalid worker quantity')
                }
                
                accountIdsLastIndex = accounts?.length - 1;
                values = accounts.reduce((str, account, currentIndex) => {
                    const appendStr = `('${body.shiftCode}','${account.account_id}', '${body.date}', ${otDurationPerPerson}, '${body.mngId}')`;
                    return str + (accountIdsLastIndex == currentIndex ? appendStr: appendStr + ',');
                },'');
                query = `INSERT INTO requests(shift_code, account_id, date, number_of_hour, mng_id) VALUES${values};`;
                

                break;

            case 'assignEveryone':
                const workerInShift: WorkOnDto[] = await this.workOnService.getWorkOnOfShift(body.shiftCode, body.date);
                const workOnLastIndex = workerInShift.length - 1;
                values = workerInShift.reduce((str, workOn, currentIndex) => {
                    const appendStr = `('${body.shiftCode}','${workOn.account_id}', '${body.date}', ${body.quantity}, '${body.mngId}')`;
                    return str + (workOnLastIndex == currentIndex ? appendStr: appendStr + ',');
                },'');
                query = `INSERT INTO requests(shift_code, account_id, date, number_of_hour, mng_id) VALUES${values};`;
                console.log(query);
                break;

            case 'assignNormal':
                accountIdsLastIndex = body.accountIds.length - 1;
                values = body.accountIds.reduce((str, accountId, currentIndex) => {
                    const appendStr = `('${body.shiftCode}','${accountId}', '${body.date}', ${body.quantity}, '${body.mngId}')`;
                    return str + (accountIdsLastIndex == currentIndex ? appendStr: appendStr + ',');
                },'');
                query = `INSERT INTO requests(shift_code, account_id, date, number_of_hour, mng_id) VALUES${values};`;
                console.log(query);
                break;

            default:
                accountIdsLastIndex = body.accountIds.length - 1;
                values = body.accountIds.reduce((str, accountId, currentIndex) => {
                    const appendStr = `('${body.shiftCode}','${accountId}', '${body.date}', ${body.quantity}, '${body.mngId}')`;
                    return str + (accountIdsLastIndex == currentIndex ? appendStr: appendStr + ',');
                },'');
                query = `INSERT INTO requests(shift_code, account_id, date, number_of_hour, mng_id) VALUES${values};`;
                console.log(query);
                break;
                
        }
        
        const data: Promise<RequestDto[]> = await this.cnn.query(query).
        then((res: dbResponse)=>{
            const resResult: RequestDto[] = res.rows;
            return resResult;
        })
        .catch((e)=>{
            console.log(e);
            throw new BadRequestException('Invalid data input');
        });
        return data;
    }

    private async getOtDurationPerPersonOfShift(shiftCode: string, accounts: AccountDto[]): Promise<number>{
        const accountLastIndex = accounts.length - 1;
        const productRemainQuery = `
            SELECT product_target - success_product AS product_remain 
            FROM shifts 
            WHERE shift_code='${shiftCode}';
        `;
        
        const values = accounts.reduce((str, account, currentIndex) => {
            return str + (accountLastIndex == currentIndex ? `\'${account.account_id}\'`:`\'${account.account_id}\',`);
        },'');
        const sumPerformanceQuery = `
            SELECT sum(performance)
            FROM accounts
            WHERE account_id IN(${values})
        `;

        const productRemain: number = await this.cnn.query(productRemainQuery)
        .then((res: dbResponse)=>{
            const resResult: { product_remain: string } = res.rows.pop();
            return resResult.product_remain;
        })
        .catch((e)=>{
            console.log(e);
            throw new BadRequestException('Invalid data input');
        });
        
        const sumPerformance: number = await this.cnn.query(sumPerformanceQuery)
        .then((res: dbResponse) => {
            const resResult: { sum: string } = res.rows.pop();
            return resResult.sum;
        })
        .catch((e) => {
            console.log(e);
            throw new BadRequestException('Invalid data input');
        });

        // calulate needed ot duration
        const otDurationPerPerson: number = Math.round(productRemain / sumPerformance) ;
        return otDurationPerPerson;
    }

    public async deleteOtRequest(body: DeleteOtRequest) {
        const accountIdsLastIndex = body.accountIds.length - 1;
        const values = body.accountIds.reduce((str, accountId, currentIndex) => {
            const appendStr = `'${accountId}'`;
            return str + (accountIdsLastIndex == currentIndex ? appendStr: appendStr + ',');
        },'');
        const query = `
            DELETE FROM requests 
            WHERE account_id IN (${values})
            AND shift_code='${body.shiftCode}';
        `;

        await this.cnn.query(query)
            .catch((e)=>{
                console.log(e);
                throw new BadRequestException('Invalid account id');
            });
    }

    public async getRequestByAccountId(accId: string){
        if(!isNumber(parseInt(accId))) throw new BadRequestException('Invalid account id');

        const query = `
            SELECT shift_code, date, number_of_hour, req_status, create_at 
            FROM requests
            WHERE account_id='${accId}'
            ORDER BY create_at DESC;
        `;

        const requests: RequestDto[] = await this.cnn.query(query)
            .then((res: dbResponse)=>{
                return res.rows
            })
            .catch((e)=>{
                console.log(e);
                throw new BadRequestException('Invalid account id');
            });

        return requests;
    }
}
