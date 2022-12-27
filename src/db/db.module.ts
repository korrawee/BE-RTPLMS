import { Module } from '@nestjs/common';
import { PG_CONNECTION } from '../constants';
import { Pool } from 'pg';

const pool = new Pool({
  user: 'postgres',
  host: 'database-2.cppxynlthmto.ap-northeast-1.rds.amazonaws.com',
  database: 'test_seed',
  password:'12345678',
  port: 5432,
});

const dbProvider = {
  provide: PG_CONNECTION,
  useValue: pool,
};

@Module({
  providers: [dbProvider],
  exports: [dbProvider],
})
export class DbModule {}
