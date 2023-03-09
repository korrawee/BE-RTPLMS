import { Module } from '@nestjs/common';
import { ShiftController } from './shift.controller';
import { ShiftService } from './shift.service';

@Module({
    providers: [ShiftService],
    controllers: [ShiftController],
    exports: [ShiftService],
})
export class ShiftModule {}
