import { ConfigModule, ConfigService } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AccountController } from './account/account.controller';
import { AccountService } from './account/account.service';
import { AccountModule } from './account/account.module';
import { DashboardController } from './screens/dashboard/dashboard.controller';
import { DashboardService } from './screens/dashboard/dashboard.service';
import { ShiftService } from './shift/shift.service';
import { DepartmentService } from './department/department.service';
import { DepartmentController } from './department/department.controller';
import { ShiftController } from './shift/shift.controller';
import { PostgresModule } from 'nest-postgres';
import { DetailController } from './screens/detail/detail.controller';
import { DetailService } from './screens/detail/detail.service';
import { WorkOnService } from './relations/work-on/work-on.service';
import { RequestService } from './relations/request/request.service';
import { WorkOnController } from './relations/work-on/work-on.controller';
import { RequestController } from './relations/request/request.controller';
import { RequestModule } from './relations/request/request.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.${process.env.NODE_ENV}.env`,
    }), 
    PostgresModule.forRootAsync({
      imports: [ConfigModule],
      
      useFactory: async(configService: ConfigService) => {
        console.log({connectionString: `postgresql://${configService.get('POSTGRES_USER')}:${configService.get('POSTGRES_PASSWORD')}@${configService.get('POSTGRES_HOST')}:${configService.get<number>('POSTGRES_PORT')}/${configService.get('POSTGRES_DB')}`,
      })
        return {connectionString: `postgresql://${configService.get('POSTGRES_USER')}:${configService.get('POSTGRES_PASSWORD')}@${configService.get('POSTGRES_HOST')}:${configService.get<number>('POSTGRES_PORT')}/${configService.get('POSTGRES_DB')}`,
      }},
      inject: [ConfigService]
    }),
    AccountModule,
    RequestModule],
  controllers: [AppController, AccountController, DashboardController, DepartmentController, ShiftController, DetailController, WorkOnController, RequestController],
  providers: [AppService, AccountService, DashboardService, ShiftService, DepartmentService, DetailService, WorkOnService, RequestService],
})
export class AppModule {}
