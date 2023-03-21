import { Module } from '@nestjs/common';
import { DepartmentModule } from '../../department/department.module';
import { ShiftModule } from '../../shift/shift.module';
import { LogModule } from '../../log/log.module';
import { WorkOnController } from './work-on.controller';
import { WorkOnService } from './work-on.service';

@Module({
    imports: [LogModule, ShiftModule, DepartmentModule],
    controllers: [WorkOnController],
    providers: [WorkOnService],
    exports: [WorkOnService],
})
export class WorkOnModule {}
