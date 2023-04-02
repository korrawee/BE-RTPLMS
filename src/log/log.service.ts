import {
    BadGatewayException,
    BadRequestException,
    Injectable,
} from '@nestjs/common';
import { isNumber } from 'class-validator';
import { InjectClient } from 'nest-postgres';
import { Client } from 'pg';
import { dbResponse } from '../db/db.response.type';
import { CreateLogDto } from './dto/CreateLog.dto';
import { LogDto } from './dto/Log.dto';

@Injectable()
export class LogService {
    constructor(@InjectClient() private readonly cnn: Client) {}

    public async getAllByIdAndDate(mngId: string, date: string) {
        if (!isNumber(parseInt(mngId)))
            throw new BadRequestException('manager id must be an integer');
        const query = `
            SELECT * 
            FROM logs 
            GROUP BY log_id 
            HAVING cast(create_at AS date)='${date}' AND mng_id='${mngId}';
        `;

        let logs: LogDto[] = await this.cnn
            .query(query)
            .then((res: dbResponse) => {
                return res.rows;
            })
            .catch((e) => {
                throw new BadGatewayException(e.message);
            });

        return logs;
    }

    public async createLog(body: CreateLogDto) {
        // Convert body object to string of column names and values
        const columns = Object.keys(body).toString();
        const values = Object.values(body);
        const valuesLastIndex = values.length - 1;

        const queryValues = values.reduce((str, v, currentIndex) => {
            let value: string;
            if (typeof v === 'object') {
                value = `'${JSON.stringify(v)}'`;
            } else {
                value = `'${v}'`;
            }
            return (
                str + (currentIndex == valuesLastIndex ? value : value + ',')
            );
        }, '');

        const query = `
            INSERT INTO logs(${columns}) 
            VALUES(${queryValues});
        `;

        const logs: LogDto[] = await this.cnn
            .query(query)
            .then((res: dbResponse) => {
                return res.rows;
            })
            .catch((e) => {
                throw new BadGatewayException(e.message);
            });

        return logs;
    }

    public async deleteLogById(logId: string) {
        if (!isNumber(parseInt(logId)))
            throw new BadRequestException('Invalid manager id');

        const query = `
            DELETE FROM logs 
            WHERE log_id='${logId}';
        `;

        const res = await this.cnn
            .query(query)
            .then((res: dbResponse) => {
                return { message: `Deleted log number ${logId}.` };
            })
            .catch((e) => {
                throw new BadGatewayException(e.message);
            });

        return res;
    }
}
