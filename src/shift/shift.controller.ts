import { Controller, Get, Param, Query } from '@nestjs/common';
import { ShiftService } from './shift.service';

@Controller('shifts')
export class ShiftController {
    constructor(private readonly shiftService: ShiftService){}

    @Get('/departments/:id/:date')
    getshift(@Param('id') id: string, @Param('date') date: string){
        return this.shiftService.getShiftsById([id],date);
    }
}
