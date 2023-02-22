import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Kafka, Producer, ProducerRecord } from 'kafkajs';

@Injectable()
export class ProducerService implements OnModuleInit{
    constructor(
        private readonly configService: ConfigService
    ){}

    private readonly kafka = new Kafka({
        brokers: [this.configService.get<string>('KAFKA_BROKER')],
        clientId: this.configService.get<string>('KAFKA_CLIENT_ID')
    });

    private readonly producer: Producer = this.kafka.producer();

    async onModuleInit() {
        await this.producer.connect();
    }

    async produce(record: ProducerRecord) {
        await this.producer.send(record);
    }

    async onApplicationShutdown() {
        await this.producer.disconnect();
    }
}
