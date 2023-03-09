import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ProducerService } from './producer.service';
import { ProducerController } from './producer.controller';

@Module({
    imports: [ConfigModule],
    providers: [ProducerService],
    exports: [ProducerService],
    controllers: [ProducerController],
})
export class ProducerModule {}
