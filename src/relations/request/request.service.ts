import { Injectable } from '@nestjs/common';
import { InjectClient } from 'nest-postgres';
import { dbResponse } from 'src/db/db.response.type';
import { Client } from 'pg';

@Injectable()
export class RequestService {
    constructor(@InjectClient() private readonly cnn: Client){}

    public async getRequest(shiftCode: string, accountId: string, date: string){
        const query = `SELECT number_of_hour, req_status 
        FROM requests 
        WHERE shift_code='${shiftCode}' AND 
        account_id='${accountId}' AND 
        date='${date}';
        `;

        return await this.cnn.query(query)
            .then((res: dbResponse) => {

                return res.rows[0];
            });
    }
}
