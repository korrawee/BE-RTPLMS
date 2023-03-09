import { Module } from '@nestjs/common';
import { LogModule } from '../../log/log.module';
import { LogScreenController } from './log.controller';
import { LogSrceenService } from './log.service';

@Module({
    controllers: [LogScreenController],
    providers: [LogSrceenService],
    imports: [LogModule],
})
export class LogScreenModule {}
