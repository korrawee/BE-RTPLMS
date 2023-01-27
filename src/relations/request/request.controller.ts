import { Body, Controller, Delete, Get, HttpCode, HttpException, HttpStatus, Injectable, Param, Post, Query } from '@nestjs/common';
import { CreateOtRequestDto } from './dto/createOtRequest.dto';
import { DeleteOtRequest } from './dto/DeleteOtRequest.dto';
import { RequestService } from './request.service';

@Injectable()
@Controller('request')
export class RequestController {
    constructor(private readonly reqService: RequestService){}

    @Get('/shifts/:shiftCode')
    public async getAllRequest(@Param('shiftCode') shiftCode: string, @Query('date') date: string){
        return await this.reqService.getAllRequestByShiftAndDate(shiftCode, date);
    }

    @Post()
    public async createOtRequest(@Body() body: CreateOtRequestDto){
        return await this.reqService.createOtRequest(body);
    }

    @Delete()
    public async deleteOtRequest(@Body() body: DeleteOtRequest) {
        return await this.reqService.deleteOtRequest(body);
    }
}
