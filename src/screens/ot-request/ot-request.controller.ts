import { Controller, Get, Param } from '@nestjs/common';
import { OtRequestService } from './ot-request.service';

@Controller('ot-request')
export class OtRequestController {
    constructor(private readonly otRequestService: OtRequestService) {}

    @Get('accounts/:accId')
    public async getOtRequest(@Param('accId') accId: string) {
        return await this.otRequestService.getOtRequest(accId);
    }
}
