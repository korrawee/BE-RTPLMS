import { Module } from '@nestjs/common';
import { DepartmentService } from './department.service';

@Module({
    providers: [DepartmentService],
    exports: [DepartmentService],
})
export class DepartmentModule {}
