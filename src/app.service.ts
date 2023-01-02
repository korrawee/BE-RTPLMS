import { Injectable, Inject } from '@nestjs/common';
import { Client } from 'pg';
import { InjectClient } from 'nest-postgres';

@Injectable()
export class AppService {
  constructor(@InjectClient() private conn: Client) {}

  async getUsers() {
    return "Hello world";
  }
}
