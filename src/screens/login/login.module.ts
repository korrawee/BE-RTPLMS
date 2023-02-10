import { Module } from '@nestjs/common';
import { AccountModule } from 'src/account/account.module';
import { LoginController } from './login.controller';
import { LoginService } from './login.service';

@Module({
  imports: [AccountModule],
  controllers: [LoginController],
  providers: [LoginService]
})
export class LoginModule {}
