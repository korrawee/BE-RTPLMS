import { Module } from '@nestjs/common';
import { AccountModule } from 'src/account/account.module';
import { RequestModule } from 'src/relations/request/request.module';
import { WorkOnModule } from 'src/relations/work-on/work-on.module';

@Module({
    imports: [
        AccountModule,
        RequestModule,
        WorkOnModule,
    ],
    providers: [],
})
export class DetailModule {}
