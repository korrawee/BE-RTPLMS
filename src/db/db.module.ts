import { Module } from '@nestjs/common';
import { Pool } from 'pg';
import { PG_CONNECTION } from '../constants';

const dbProvider = {
  provide: PG_CONNECTION,
  useValue: new Pool({
    user: 'korrawee_',
    host: 'localhost',
    database: 'test_seed',
    password:'1234',
    port: 5432,
  }),
};

@Module({
  providers: [dbProvider],
  exports: [dbProvider],
})
export class DbModule {}
