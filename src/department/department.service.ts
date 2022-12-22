import { Inject, Injectable } from '@nestjs/common';
import { PG_CONNECTION } from '../constants';
import { dbResponse } from 'src/db/db.response.type';
import { DepartmentforDashboardDto } from './dto/DepartmentforDashboard.dto';

@Injectable()
export class DepartmentService {
    constructor(@Inject(PG_CONNECTION) private readonly cnn: any){}

    async getDepartmentById(mngId: string){
        const query = `select department_id, name from departments where mng_id='${mngId}'`;
        const department: DepartmentforDashboardDto = await this.cnn.query(query)
        .then(async (res: dbResponse) => {
            return res.rows.pop();

        })
        .catch((error) => {
            console.error(error);
            return {status: 200, message: error.message};
        });

        return department;
    }
}
