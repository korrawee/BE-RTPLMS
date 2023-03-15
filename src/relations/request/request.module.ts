import { Module } from '@nestjs/common';
import { DepartmentModule } from 'src/department/department.module';
import { ShiftModule } from 'src/shift/shift.module';
import { AccountModule } from '../../account/account.module';
import { LogModule } from '../../log/log.module';
import { WorkOnModule } from '../work-on/work-on.module';
import { RequestController } from './request.controller';
import { RequestService } from './request.service';

@Module({
    imports: [
        WorkOnModule,
        AccountModule,
        ShiftModule,
        DepartmentModule,
        LogModule,
    ],
    controllers: [RequestController],
    providers: [RequestService],
    exports: [RequestService],
})
export class RequestModule {}
