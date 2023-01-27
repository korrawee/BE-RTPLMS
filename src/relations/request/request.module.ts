import { Module } from '@nestjs/common';
import { AccountModule } from 'src/account/account.module';
import { WorkOnModule } from '../work-on/work-on.module';
import { RequestController } from './request.controller';
import { RequestService } from './request.service';

@Module({
    imports: [WorkOnModule, AccountModule],
    controllers: [RequestController],
    providers: [RequestService],
    exports: [RequestService],
})
export class RequestModule {}
