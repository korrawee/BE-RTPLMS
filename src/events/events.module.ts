import { Module } from '@nestjs/common';
import { ShiftModule } from '../shift/shift.module';
import { EventsGateway } from './events.gateway';

@Module({
    imports: [ShiftModule],
    providers: [EventsGateway],
})
export class EventsModule {}
