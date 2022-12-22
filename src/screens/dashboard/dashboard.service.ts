import { Injectable } from '@nestjs/common';
import { DepartmentService } from '../../department/department.service';
import { DepartmentforDashboardDto } from '../../department/dto/DepartmentforDashboard.dto';
import { ShiftforDashboardDto } from '../../shift/dto/ShiftForDashboard.dto';
import { ShiftService } from '../../shift/shift.service';
import { DashboardCardDto } from './dto/dashboardCard.dto';

@Injectable()
export class DashboardService {
    constructor(private readonly shiftService: ShiftService, private readonly departmentService: DepartmentService){}

    public async getData(mngId: string){
        const department: DepartmentforDashboardDto = await this.departmentService.getDepartmentById(mngId);
        const shifts: ShiftforDashboardDto[] = await this.shiftService.getShiftsById(department.department_id);

        const data: DashboardCardDto = {
            department: department, 
            shifts: shifts,
        };
        
        return data;
    }
}
