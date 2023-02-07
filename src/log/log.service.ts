import { BadGatewayException, BadRequestException, Injectable } from '@nestjs/common';
import { isEmpty, isNumber } from 'class-validator';
import { InjectClient } from 'nest-postgres';
import { Client } from 'pg';
import { dbResponse } from 'src/db/db.response.type';
import { CreateLogDto } from './dto/CreateLog.dto';
import { LogDto } from './dto/Log.dto';

@Injectable()
export class LogService {
    constructor( 
        @InjectClient() private readonly cnn: Client
    ){}

    public async getAllByIdAndDate(mngId: string, date: string){
        if(!isNumber(parseInt(mngId))) throw new BadRequestException('Invalid manager id');
        const query = `
            SELECT * 
            FROM logs 
            GROUP BY log_id 
            HAVING cast(create_at AS date)='${date}' AND mng_id='${mngId}';
        `;

        let logs: LogDto[] = await this.cnn.query(query)
            .then((res: dbResponse)=>{
                return res.rows;
            })
            .catch(e=>{
                console.log(e);
                throw new BadGatewayException('Invalid Input Data');
            }) 

        return logs;
    }

    public async createLog(body: CreateLogDto){
        // Convert body object to string of column names and values
        const columns = Object.keys(body).toString();
        let values = Object.values(body)
        const valuesLastIndex = values.length - 1;
            
        values = values.reduce((str, v, currentIndex)=>{
            const value = `'${v}'`;
            return str + (currentIndex == valuesLastIndex) ? value:(value + ',');
        },''); 

        const query = `
            INSERT INTO logs(${columns}) 
            VALUES(${values});
        `;

        const logs: LogDto[] = await this.cnn.query(query)
            .then((res: dbResponse)=>{
                return res.rows;
            })
            .catch(e=>{
                console.log(e);
                throw new BadGatewayException('Invalid Input Data');
            }) 

        return logs;
    }

    public async deleteLogById(logId: string){

        if(!isNumber(parseInt(logId))) throw new BadRequestException('Invalid manager id');


        const query = `
            DELETE FROM logs 
            WHERE log_id='${logId}';
        `;
        
        const res = await this.cnn.query(query)
        .then((res: dbResponse)=>{
            return {message:`Deleted log number ${logId}.`};
        })
        .catch(e=>{
            console.log(e);
            throw new BadGatewayException('Invalid Input Data');
        }) 

    return res;
    }
}
