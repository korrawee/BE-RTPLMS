import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ShiftModule } from '../../shift/shift.module';
import { ConsumerService } from './consumer.service';
import { ProductConsumer } from './product.consumer';

@Module({
    imports: [ConfigModule, ShiftModule],
    providers: [ConsumerService, ProductConsumer],
    exports: [ConsumerService],
})
export class ConsumerModule {}
