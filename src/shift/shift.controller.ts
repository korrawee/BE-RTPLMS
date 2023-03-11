import { Body, Controller, Get, Param, Patch } from '@nestjs/common';
import { UpdateShiftDto } from './dto/UpdateShift.dto';
import { ShiftService } from './shift.service';

@Controller('shifts')
export class ShiftController {
    constructor(private readonly shiftService: ShiftService) {}

    @Get('/departments/:id/:date')
    async getshift(@Param('id') id: string, @Param('date') date: string) {
        return await this.shiftService.getShiftsById([id], date);
    }

    @Patch()
    async updateShift(@Body() body: UpdateShiftDto) {
        return await this.shiftService.updateShift(body);
    }
}
