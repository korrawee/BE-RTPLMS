import { BadRequestException, Injectable } from '@nestjs/common';
import { dbResponse } from '../db/db.response.type';
import { CreateAccountDto } from './dto/CreateAccount.dto';
import { Client } from 'pg';
import { InjectClient } from 'nest-postgres';
import { AccountDto } from './dto/AccountDto';

@Injectable()
export class AccountService {
    constructor(@InjectClient() private cnn: Client) {}

    public async create(createAccountDto: CreateAccountDto) {
        let data: any;
        const columns: string = Object.keys(createAccountDto).toString();
        const values: Array<string> = Object.values(createAccountDto);
        const strValues: string = values.reduce((str, value, currentIndex) => {
            if (typeof value == 'object') {
                value = JSON.stringify(values);
            }
            return (
                str +
                (currentIndex === values.length - 1
                    ? `\'${value}\'`
                    : `\'${value}\',`)
            );
        }, '');

        const query: string = `INSERT INTO accounts(${columns}) 
        VALUES (${strValues}) 
        RETURNING *
        `;

        data = await this.cnn
            .query(query)
            .then((res: dbResponse) => {
                return res.rows;
            })
            .catch((error) => {
                console.error(error.detail);
                throw new BadRequestException('Invalid input data');
            });

        return data;
    }

    public async findAll() {
        const data: AccountDto[] = await this.cnn
            .query(`SELECT * FROM accounts`)
            .then((res: dbResponse) => {
                if (res.rows.length == 0) {
                    return new Error('No Content.');
                }
                return res.rows;
            })
            .catch((error: Error) => {
                console.error(error);
                throw new BadRequestException(error.message);
            });

        return data;
    }
    public async find(id: string) {
        if (!Number.isInteger(parseInt(id)))
            throw new BadRequestException('account id must be an integer');
        let data: any;
        await this.cnn
            .query(`SELECT * FROM accounts WHERE account_id='${id}';`)
            .then((res: dbResponse) => {
                if (res.rows.length == 0) {
                    return new Error(`No account_id = ${id}`);
                }
                data = res.rows.pop();
            })
            .catch((error: any) => {
                console.error(error);
                throw new BadRequestException(error.message);
            });

        return data;
    }

    public async findByIds(accountIds: string[]) {
        const newAccountIds = accountIds.reduce(
            (str: string, id: string, index: number) => {
                if (!Number.isInteger(parseInt(id)))
                    throw new BadRequestException(
                        'account id must be an integer'
                    );
                return (
                    str + ` '${id}'${index != accountIds.length - 1 ? ',' : ''}`
                );
            },
            ''
        );

        const query = `SELECT * FROM accounts WHERE account_id IN (${newAccountIds}) ORDER BY cast(account_id AS int);`;
        const data = await this.cnn
            .query(query)
            .then((res: dbResponse) => {
                return res.rows;
            })
            .catch((error: any) => {
                console.error(error);
                throw new BadRequestException(error.message);
            });
        return data;
    }

    public async updateUsername(id: string, newUsername: string) {
        if (!Number.isInteger(parseInt(id)))
            throw new BadRequestException('account id must be an integer');

        const query = `UPDATE accounts SET username='${newUsername}' WHERE account_id='${id}';`;
        const data = await this.cnn
            .query(query)
            .then((res: dbResponse) => res.rows)
            .catch((e) => {
                throw new BadRequestException(e.message);
            });

        return data;
    }

    public async findByUsernamePassword(user: string, pass: string) {
        const query = `
            SELECT * 
            FROM accounts 
            WHERE username='${user}' AND password='${pass}';
        `;

        const data: AccountDto = await this.cnn
            .query(query)
            .then((res: dbResponse) => {
                if (res.rows.length == 0) {
                    throw new BadRequestException(`Wrong email or password`);
                }

                return res.rows.pop();
            })
            .catch((error: any) => {
                console.error(error);
                throw new BadRequestException('Invalid input data');
            });

        return data;
    }
}
