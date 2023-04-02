import { BadRequestException, Injectable } from '@nestjs/common';
import { dbResponse } from '../db/db.response.type';
import { DepartmentforDashboardDto } from './dto/DepartmentforDashboard.dto';
import { Client } from 'pg';
import { InjectClient } from 'nest-postgres';

@Injectable()
export class DepartmentService {
    constructor(@InjectClient() private readonly cnn: Client) {}
    
    async getDepartmentsById(mngId: string) {
        if (!Number.isInteger(parseInt(mngId)))
        throw new BadRequestException('manager id must be an integer.');
        
        const query = `select department_id, name from departments where mng_id='${mngId}';`;
        const department: DepartmentforDashboardDto[] = await this.cnn
        .query(query)
        .then((res: dbResponse) => {
            return res.rows;
        })
        .catch((e: any) => {
            console.error(e);
            throw new BadRequestException(e.message);
        });
        return department;
    }

    async getDepartmentById(departId: string) {
        const query = `
            SELECT *
            FROM departments
            WHERE department_id='${departId}'
            ;
        `;
        const department = await this.cnn
            .query(query)
            .then((res: dbResponse) => {
                return res.rows.pop();
            })
            .catch((e: any) => {
                console.error(e);
                throw new BadRequestException(e.message);
            });

        return department;
    }
}
