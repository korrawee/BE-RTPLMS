import { Injectable } from '@nestjs/common';
import { dbResponse } from 'src/db/db.response.type';
import { DepartmentforDashboardDto } from './dto/DepartmentforDashboard.dto';
import { Client } from 'pg';
import { InjectClient } from 'nest-postgres';


@Injectable()
export class DepartmentService {
    constructor(@InjectClient() private readonly cnn: Client){}

    async getDepartmentsById(mngId: string){
        const query = `select department_id, name from departments where mng_id='${mngId}'`;
        const department: DepartmentforDashboardDto[] = await this.cnn.query(query)
        .then(async (res: dbResponse) => {
            console.log(res.rows);
            return res.rows;

        })
        .catch((error) => {
            console.error(error);
            return {status: 200, message: error.message};
        });

        return department;
    }
}
