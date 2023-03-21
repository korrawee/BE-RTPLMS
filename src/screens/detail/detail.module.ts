import { Module } from '@nestjs/common';
import { AccountModule } from '../../account/account.module';
import { RequestModule } from '../../relations/request/request.module';
import { WorkOnModule } from '../../relations/work-on/work-on.module';
import { DetailController } from './detail.controller';
import { DetailService } from './detail.service';
import { ShiftModule } from '../../shift/shift.module';

@Module({
    imports: [AccountModule, RequestModule, WorkOnModule, ShiftModule],
    providers: [DetailService],
    controllers: [DetailController],
})
export class DetailModule {}
