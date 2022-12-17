import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DbModule } from './db/db.module';
import { AccountController } from './account/account.controller';
import { AccountService } from './account/account.service';
import { AccountModule } from './account/account.module';

@Module({
  imports: [DbModule, AccountModule],
  controllers: [AppController, AccountController],
  providers: [AppService, AccountService],
})
export class AppModule {}
