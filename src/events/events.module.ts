import { Module } from '@nestjs/common';
import { ConsumerModule } from 'src/kafka/consumer/consumer.module';
import { EventsGateway } from './events.gateway';

@Module({
    imports: [ConsumerModule],
    providers: [EventsGateway],
})
export class EventsModule {}
