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
            .catch((error: any) => {
                console.error(error);
                throw new BadRequestException(error.message);
            });

        return department;
    }
}
