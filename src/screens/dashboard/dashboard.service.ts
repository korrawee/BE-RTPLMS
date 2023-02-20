import { Injectable } from '@nestjs/common';
import { DepartmentService } from '../../department/department.service';
import { DepartmentforDashboardDto } from '../../department/dto/DepartmentforDashboard.dto';
import { ShiftforDashboardDto } from '../../shift/dto/ShiftForDashboard.dto';
import { ShiftService } from '../../shift/shift.service';
import { DashboardCardDto } from './dto/dashboardCard.dto';
import { InjectClient } from 'nest-postgres';
import { Client } from 'pg';

@Injectable()
export class DashboardService {
    constructor(private readonly shiftService: ShiftService, private readonly departmentService: DepartmentService, @InjectClient() private readonly cnn: Client){}

    public async getData(mngId: string){
        const departments: DepartmentforDashboardDto[] = await this.departmentService.getDepartmentsById(mngId);
        const departmentId: string[] = departments.map((department: DepartmentforDashboardDto)=>{
            return department.department_id;
        });
        const shifts: ShiftforDashboardDto[] = await this.shiftService.getShiftsById(departmentId);
        const data: DashboardCardDto = {
            department: departments, 
            shifts: shifts,
        };
        console.log(data);
        return data;
    }
}
