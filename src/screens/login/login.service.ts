import { Injectable } from '@nestjs/common';
import { AccountService } from 'src/account/account.service';
import { AccountDto } from 'src/account/dto/AccountDto';
import { LoginDto } from './dto/Login.dto';

@Injectable()
export class LoginService {
    constructor(private readonly accountService: AccountService) {}

    public async login(body: LoginDto){
        const {username, password} = body;

        const acc: AccountDto = await this.accountService.findByEmailPassword(username, password);

        const res = {
            id: acc.account_id,
            role: acc.role
        }
        return res
    }
}
