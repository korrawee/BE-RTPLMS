import { Controller, Get, Param, Query } from '@nestjs/common';
import { ShiftService } from './shift.service';

@Controller('shifts')
export class ShiftController {
    constructor(private readonly shiftService: ShiftService){}

    @Get('/departments/:id')
    getshift(@Param('id') id: string){
        return this.shiftService.getShiftsById([id]);
    }
}
