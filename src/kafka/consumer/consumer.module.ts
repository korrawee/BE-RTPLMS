import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DepartmentModule } from '../../department/department.module';
import { RequestModule } from '../../relations/request/request.module';
import { WorkOnModule } from '../../relations/work-on/work-on.module';
import { ShiftModule } from '../../shift/shift.module';
import { AttendanceConsumer } from './attendace.consumer';
import { ConsumerService } from './consumer.service';
import { ProductConsumer } from './product.consumer';

@Module({
    imports: [ConfigModule, ShiftModule, DepartmentModule, WorkOnModule, RequestModule],
    providers: [ConsumerService, ProductConsumer, AttendanceConsumer],
    exports: [ConsumerService, ProductConsumer, AttendanceConsumer],
})
export class ConsumerModule {}
