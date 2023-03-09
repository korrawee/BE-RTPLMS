import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
    Consumer,
    ConsumerRunConfig,
    ConsumerSubscribeTopics,
    Kafka,
} from 'kafkajs';

@Injectable()
export class ConsumerService {
    constructor(private readonly configService: ConfigService) {}

    // Connect to kafka broker
    private readonly kafka = new Kafka({
        brokers: [this.configService.get<string>('KAFKA_BROKER')],
        clientId: this.configService.get<string>('KAFKA_CLIENT_ID'),
    });

    // Store available consumers
    private consumer: Consumer;

    async consume(topics: ConsumerSubscribeTopics, config: ConsumerRunConfig) {
        this.consumer = this.kafka.consumer({ groupId: 'consumer-group' });
        await this.consumer.connect();
        await this.consumer.subscribe(topics);
        await this.consumer.run(config);
    }

    async onApplicationShutdown() {
        await this.consumer?.disconnect();
    }
}
