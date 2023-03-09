import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Kafka, Partitioners, Producer, ProducerRecord } from 'kafkajs';

@Injectable()
export class ProducerService implements OnModuleInit {
    constructor(private readonly configService: ConfigService) {}

    private readonly kafka = new Kafka({
        brokers: [this.configService.get<string>('KAFKA_BROKER')],
        clientId: this.configService.get<string>('KAFKA_CLIENT_ID'),
    });

    private readonly producer: Producer = this.kafka.producer({
        createPartitioner: Partitioners.LegacyPartitioner,
    });

    async onModuleInit() {
        await this.producer.connect();
    }

    async produce(record: ProducerRecord) {
        await this.producer.connect();
        await this.producer.send(record);
        await this.producer.disconnect();
    }

    async onApplicationShutdown() {
        await this.producer.disconnect();
    }
}
