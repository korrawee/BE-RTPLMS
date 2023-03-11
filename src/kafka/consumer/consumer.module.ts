import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DepartmentModule } from 'src/department/department.module';
import { ShiftModule } from '../../shift/shift.module';
import { ConsumerService } from './consumer.service';
import { ProductConsumer } from './product.consumer';

@Module({
    imports: [ConfigModule, ShiftModule, DepartmentModule],
    providers: [ConsumerService, ProductConsumer],
    exports: [ConsumerService, ProductConsumer],
})
export class ConsumerModule {}
