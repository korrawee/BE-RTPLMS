import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectClient } from 'nest-postgres';
import { Client } from 'pg';
import { DepartmentforDashboardDto } from '../../department/dto/DepartmentforDashboard.dto';

@Injectable()
export class ControlService {
    constructor(@InjectClient() private readonly cnn: Client) {}

    async getDepartmentInfoByShiftId(shiftCode: string) {
        const query = `
            SELECT *
            FROM _controls AS c
            INNER JOIN departments AS d
            ON c.department_id=d.department_id
            WHERE shift_code='${shiftCode}'
        ;`;

        const department: DepartmentforDashboardDto = await this.cnn
            .query(query)
            .then((res) => res.rows.pop())
            .catch((e) => {
                throw new BadRequestException(e);
            });

        return department;
    }
}
