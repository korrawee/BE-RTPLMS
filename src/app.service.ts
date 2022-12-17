import { Injectable, Inject } from '@nestjs/common';
import { PG_CONNECTION } from './constants';

@Injectable()
export class AppService {
  constructor(@Inject(PG_CONNECTION) private conn: any) {}

  async getUsers() {
    return "Hello world";
  }
}
