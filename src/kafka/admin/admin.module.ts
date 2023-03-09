import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AdminService } from './admin.service';

@Module({
    imports: [ConfigModule],
    providers: [AdminService],
})
export class AdminModule {}
