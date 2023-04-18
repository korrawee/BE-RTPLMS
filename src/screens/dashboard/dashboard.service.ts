import { BadRequestException, Injectable } from '@nestjs/common';
import { DepartmentService } from '../../department/department.service';
import { DepartmentforDashboardDto } from '../../department/dto/DepartmentforDashboard.dto';
import { ShiftforDashboardDto } from '../../shift/dto/ShiftForDashboard.dto';
import { ShiftService } from '../../shift/shift.service';
import { DashboardCardDto } from './dto/dashboardCard.dto';
import { InjectClient } from 'nest-postgres';
import { Client } from 'pg';

@Injectable()
export class DashboardService {
    constructor(
        private readonly shiftService: ShiftService,
        private readonly departmentService: DepartmentService,
        @InjectClient() private readonly cnn: Client
    ) {}

    public async getData(mngId: string, limit: string, currentPage: number): Promise<DashboardCardDto> {
        const departments: DepartmentforDashboardDto[] =
            await this.departmentService.getDepartmentsById(mngId);
        const departmentId: string[] = departments.map(
            (department: DepartmentforDashboardDto) => {
                return department.department_id;
            }
        );
        const shifts: ShiftforDashboardDto[] =
            await this.shiftService.getShiftsById(departmentId);
        
        // get all data
        if(limit === '*'){
            return {
                department: departments,
                shifts: shifts
            };
        }

        // default case
        if(currentPage == 1){
            return {
                department: departments.slice(0,+limit),
                shifts: shifts.slice(0,+limit),
            };
        }else{
            const startIndex = +limit * (currentPage - 1);
            const EndIndex = +limit * currentPage;
            return {
                department: departments.slice(startIndex, EndIndex),
                shifts: shifts.slice(startIndex, EndIndex),
            };
        }
    }
}
