import { Injectable } from '@nestjs/common';
import { dbResponse } from 'src/db/db.response.type';
import { CreateAccountDto } from './dto/CreateAccount.dto';
import { Client } from 'pg';
import { InjectClient } from 'nest-postgres';
import { AccountDto } from './dto/Account.dto';

@Injectable()
export class AccountService {

    constructor(@InjectClient() private cnn: Client) {}

    public async create(createAccountDto: CreateAccountDto) {
        let data: any;
        const columns: string = Object.getOwnPropertyNames(createAccountDto).toString();
        const values: Array<any> = Object.values(createAccountDto);
        
        const query: string = `INESERT INTO accounts(${columns}) 
        VALUES ('${values[0]}', '${values[1]}', '${values[2]}', '${values[3]}',
                '${values[4]}', '${values[5]}', '${JSON.stringify(values[6])}', '${values[7]}') 
        RETURNING *
        `;
        await this.cnn.query(query)
        .then((res: dbResponse) => {
            data = res.rows;
        })
        .catch((error) => {
            data = {status: 200, message: error.message};
            console.error(error);
        });

        return data;
    }

    public async findAll() {
        const data: AccountDto[] = await this.cnn.query(`SELECT * FROM accounts`)
        .then((res: dbResponse) => {
            if(res.rows.length == 0){
                return new Error('No Content.')
            }
            return res.rows;
        })
        .catch((error: Error) => {
            console.error(error);
        });

        return data;
    }
    public async find(id: string) {
        let data: any;
        await this.cnn.query(`SELECT * FROM account WHERE account_id='${id}'`)
        .then((res: dbResponse) => {
            if(res.rows.length == 0){
                return new Error(`No account_id = ${id}`);
            }
            data = res.rows.pop();
        })
        .catch((error: any) => {
            data = { status: 400, message: error.message};
            console.error(error);
        });

        return data;
    }

    public async findByIds(accountIds: string[]) {
        const newAccountIds = accountIds
            .reduce((str: string, id: string, index:number)=>{
                return str + ` '${id}'${((index != accountIds.length - 1) ? ',':'')}`;
            },"")
        
        const query = `SELECT * FROM accounts WHERE account_id IN (${newAccountIds})`;

        return await this.cnn.query(query)
            .then((res: dbResponse) => {
                if(res.rows.length == 0){
                    return new Error();
                }
                return res.rows;
            })
            .catch((error: any) => {
                return { status: 400, message: error.message};
            });
    }

    public async updateUsername(id: string, newUsername: string) {
        let data: any;
        await this.cnn.query(`UPDATE accounts SET username='${newUsername}' WHERE account_id='${id}'`)
        .then((res: dbResponse) => {
            if(res.rows.length == 0){
                return new Error(`Bad Request.`);
            }
            data = res.rows.pop();
        })
        .catch((error: any) => {
            data = { status: 400, message: error.message};
            console.error(error);
        });

        return data;
    }

    public getCheckInStatus(accountId: string){
        return 'ปกติ';
    }
}
