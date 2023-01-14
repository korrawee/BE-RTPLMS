import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { AccountService } from './account.service';
import { CreateAccountDto } from './dto/CreateAccount.dto';

@Controller('accounts')
export class AccountController {
    constructor(private readonly accountService: AccountService) {}

    @Get()
    findAll() {
        return this.accountService.findAll();
    }
    @Get(':id')
    find(@Param('id') id: string) {
        return this.accountService.find(id);
    }
    @Post()
    create(@Body() createAccountDto: CreateAccountDto) {
        return this.accountService.create(createAccountDto);
    };

    @Patch(':id/:newUsername')
    updateUsername(@Param('id') id: string, @Param('newUsername') newUsername: string) {
        return this.accountService.updateUsername(id, newUsername);
    };
}
