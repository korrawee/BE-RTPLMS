import { Module } from '@nestjs/common';
import { LogModule } from 'src/log/log.module';
import { ControlModule } from '../control/control.module';
import { WorkOnController } from './work-on.controller';
import { WorkOnService } from './work-on.service';

@Module({
    imports: [ControlModule, LogModule],
    controllers: [WorkOnController],
    providers: [WorkOnService],
    exports: [WorkOnService],
})
export class WorkOnModule {}
