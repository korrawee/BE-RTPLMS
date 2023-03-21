import { Module } from '@nestjs/common';
import { ConsumerModule } from '../kafka/consumer/consumer.module';
import { RequestModule } from '../relations/request/request.module';
import { EventsGateway } from './events.gateway';

@Module({
    imports: [ConsumerModule, RequestModule],
    providers: [EventsGateway],
})
export class EventsModule {}
