import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DepartmentModule } from 'src/department/department.module';
import { WorkOnModule } from 'src/relations/work-on/work-on.module';
import { ShiftModule } from '../../shift/shift.module';
import { AttendanceConsumer } from './attendace.consumer';
import { ConsumerService } from './consumer.service';
import { ProductConsumer } from './product.consumer';

@Module({
    imports: [ConfigModule, ShiftModule, DepartmentModule, WorkOnModule],
    providers: [ConsumerService, ProductConsumer, AttendanceConsumer],
    exports: [ConsumerService, ProductConsumer, AttendanceConsumer],
})
export class ConsumerModule {}
