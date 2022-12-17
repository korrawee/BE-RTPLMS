import { Module } from '@nestjs/common';
import { PG_CONNECTION } from '../constants';
import { Pool } from 'pg';

const pool = new Pool({
  user: 'korrawee_',
  host: 'localhost',
  database: 'test_seed',
  password:'1234',
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
