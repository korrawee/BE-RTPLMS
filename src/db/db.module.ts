import { Module } from '@nestjs/common';
import { PG_CONNECTION } from '../constants';
import { Pool } from 'pg';
import { ConfigService } from '@nestjs/config';

const config = new ConfigService;

const pool = new Pool({
  user: config.get<string>('POSTGRES_USER'),
  host: config.get<string>('POSTGRES_HOST'),
  database: config.get<string>('POSTGRES_DB'),
  password:config.get<string>('POSTGRES_PASSWORD'),
  port: config.get<string>('POSTGRES_PORT'),
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
