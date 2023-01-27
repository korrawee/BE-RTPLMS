import { Module } from '@nestjs/common';
import { WorkOnController } from './work-on.controller';
import { WorkOnService } from './work-on.service';

@Module({
    controllers: [WorkOnController],
    providers: [WorkOnService],
    exports: [WorkOnService],
})
export class WorkOnModule {}
