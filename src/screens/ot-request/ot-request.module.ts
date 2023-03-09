import { Module } from '@nestjs/common';
import { RequestModule } from '../../relations/request/request.module';
import { ShiftModule } from '../../shift/shift.module';
import { OtRequestController } from './ot-request.controller';
import { OtRequestService } from './ot-request.service';

@Module({
    imports: [ShiftModule, RequestModule],
    providers: [OtRequestService],
    controllers: [OtRequestController],
})
export class OtRequestModule {}
