import { Module } from '@nestjs/common';
import { ProducerService } from './producer/producer.service';
import { ConsumerService } from './consumer/consumer.service';
import { ConsumerModule } from './consumer/consumer.module';
import { ProducerModule } from './producer/producer.module';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [ConsumerModule, ProducerModule, AdminModule],
  providers: [ProducerService, ConsumerService],
  exports: [ProducerService, ConsumerService]
})
export class KafkaModule {}
