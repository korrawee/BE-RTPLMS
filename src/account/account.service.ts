import { Injectable } from '@nestjs/common';
import { dbResponse } from 'src/db/db.response.type';
import { CreateAccountDto } from './dto/CreateAccount.dto';
import { Client } from 'pg';
import { InjectClient } from 'nest-postgres';
import { FindAccountDto } from './dto/findAccount.dto';

@Injectable()
export class AccountService {

    constructor(@InjectClient() private cnn: Client) {}
    private entityName = 'accounts';

    public async create(createAccountDto: CreateAccountDto) {
        let data: any;
        const columns: string = Object.getOwnPropertyNames(createAccountDto).toString();
        const values: Array<any> = Object.values(createAccountDto);
        
        const query: string = `insert into ${this.entityName}(${columns}) 
        values ('${values[0]}', '${values[1]}', '${values[2]}', '${values[3]}',
                '${values[4]}', '${values[5]}', '${JSON.stringify(values[6])}', '${values[7]}') 
        returning *
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
        const data: FindAccountDto[] = await this.cnn.query(`select * from ${this.entityName}`)
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
        await this.cnn.query(`select * from ${this.entityName} where account_id='${id}'`)
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

    public async updateUsername(id: string, newUsername: string) {
        let data: any;
        await this.cnn.query(`update ${this.entityName} set username='${newUsername}' where account_id='${id}'`)
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
}
