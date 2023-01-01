import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DbModule } from './db/db.module';
import { AccountController } from './account/account.controller';
import { AccountService } from './account/account.service';
import { AccountModule } from './account/account.module';
import { DashboardController } from './screens/dashboard/dashboard.controller';
import { DashboardService } from './screens/dashboard/dashboard.service';
import { ShiftService } from './shift/shift.service';
import { DepartmentService } from './department/department.service';
import { DepartmentController } from './department/department.controller';
import { ShiftController } from './shift/shift.controller';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.${process.env.NODE_ENV}.env`,
    }), 
    DbModule, AccountModule],
  controllers: [AppController, AccountController, DashboardController, DepartmentController, ShiftController],
  providers: [AppService, AccountService, DashboardService, ShiftService, DepartmentService],
})
export class AppModule {}
