import { Module } from '@nestjs/common';
import { AccountModule } from 'src/account/account.module';
import { LogModule } from 'src/log/log.module';
import { ControlModule } from '../control/control.module';
import { WorkOnModule } from '../work-on/work-on.module';
import { RequestController } from './request.controller';
import { RequestService } from './request.service';

@Module({
    imports: [WorkOnModule, AccountModule, ControlModule, LogModule],
    controllers: [RequestController],
    providers: [RequestService],
    exports: [RequestService],
})
export class RequestModule {}
