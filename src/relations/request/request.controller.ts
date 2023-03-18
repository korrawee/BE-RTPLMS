import {
    Body,
    Controller,
    Delete,
    Get,
    Patch,
    Injectable,
    Param,
    Post,
    Query,
} from '@nestjs/common';
import { CreateOtRequestDto } from './dto/CreateOtRequest.dto';
import { DeleteOtRequest } from './dto/DeleteOtRequest.dto';
import { UpdateOtRequestDto } from './dto/UpdateOtRequest.dto';
import { RequestService } from './request.service';

@Injectable()
@Controller('request')
export class RequestController {
    constructor(private readonly reqService: RequestService) {}

    @Get('/shifts/:shiftCode')
    public async getAllRequest(
        @Param('shiftCode') shiftCode: string,
    ) {
        return await this.reqService.getAllRequestByShift_id(
            shiftCode,
        );
    }

    @Post()
    public async createOtRequest(@Body() body: CreateOtRequestDto) {
        return await this.reqService.createOtRequest(body);
    }

    @Delete()
    public async deleteOtRequest(@Body() body: DeleteOtRequest) {
        return await this.reqService.deleteOtRequest(body);
    }

    @Patch()
    public async updateRequestByShiftCodeAndAccountId(
        @Body() body: UpdateOtRequestDto
    ) {
        return await this.reqService.updateRequestByShiftCodeAndAccountId(body);
    }
}
