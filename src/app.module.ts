import { ConfigModule, ConfigService } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AccountModule } from './account/account.module';
import { PostgresModule } from 'nest-postgres';
import { RequestModule } from './relations/request/request.module';
import { WorkOnModule } from './relations/work-on/work-on.module';
import { DetailModule } from './screens/detail/detail.module';
import { ScheduleModule } from './screens/schedule/schedule.module';
import { OtRequestModule } from './screens/ot-request/ot-request.module';
import { ShiftModule } from './shift/shift.module';
import { LogScreenModule } from './screens/log/log.module';
import { LogModule } from './log/log.module';
import { LoginModule } from './screens/login/login.module';
// import { KafkaModule } from './kafka/kafka.module';
import { DepartmentModule } from './department/department.module';
import { DashboardModule } from './screens/dashboard/dashboard.module';
import { EventsModule } from './events/events.module';
import { KafkaModule } from './kafka/kafka.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: `.${process.env.NODE_ENV}.env`,
        }),
        PostgresModule.forRootAsync({
            imports: [ConfigModule],

            useFactory: async (configService: ConfigService) => {
                return {
                    connectionString: `postgresql://${configService.get(
                        'POSTGRES_USER'
                    )}:${configService.get(
                        'POSTGRES_PASSWORD'
                    )}@${configService.get(
                        'POSTGRES_HOST'
                    )}:${configService.get<number>(
                        'POSTGRES_PORT'
                    )}/${configService.get('POSTGRES_DB')}`,
                };
            },
            inject: [ConfigService],
        }),
        AccountModule,
        DashboardModule,
        DepartmentModule,
        WorkOnModule,
        RequestModule,
        DetailModule,
        ScheduleModule,
        OtRequestModule,
        ShiftModule,
        LogModule,
        LogScreenModule,
        LoginModule,
        KafkaModule,
        EventsModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
