import { Module } from '@nestjs/common';
import { DepartmentModule } from '../../department/department.module';
import { ShiftModule } from '../../shift/shift.module';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

@Module({
    imports: [ShiftModule, DepartmentModule],
    providers: [DashboardService],
    controllers: [DashboardController],
})
export class DashboardModule {}
