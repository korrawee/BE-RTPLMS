import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import { Client } from 'pg';
import { InjectClient } from 'nest-postgres';
import { ProducerService } from './kafka/producer/producer.service';

@Injectable()
export class AppService {
    constructor(
        @InjectClient() private cnn: Client,
        private readonly producerService: ProducerService
    ) {}

    async getUsers() {
        await this.producerService.produce({
            topic: 'test2',
            messages: [
                {
                    value: 'Hello World',
                },
            ],
        });
        return 'Hello world';
    }
}
