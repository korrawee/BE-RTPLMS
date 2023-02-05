import { Module } from '@nestjs/common';
import { AccountModule } from 'src/account/account.module';
import { RequestModule } from 'src/relations/request/request.module';
import { WorkOnModule } from 'src/relations/work-on/work-on.module';
import { DetailController } from './detail.controller';
import { DetailService } from './detail.service';

@Module({
    imports: [
        AccountModule,
        RequestModule,
        WorkOnModule,
    ],
    providers: [DetailService],
    controllers: [DetailController],
})
export class DetailModule {}
