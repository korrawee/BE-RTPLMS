import { Body, Controller, Post } from '@nestjs/common';
import { LoginDto } from './dto/Login.dto';
import { LoginService } from './login.service';

@Controller('login')
export class LoginController {
    constructor(private readonly loginService: LoginService){}

    @Post()
    public async doLogin(@Body() body: LoginDto) {
        return await this.loginService.login(body);
    }
}
