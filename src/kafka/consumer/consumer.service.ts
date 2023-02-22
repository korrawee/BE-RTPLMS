import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Consumer, ConsumerRunConfig, ConsumerSubscribeTopics, Kafka } from 'kafkajs';

@Injectable()
export class ConsumerService {
    constructor(
        private readonly configService: ConfigService
    ){}
    
    // Connect to kafka broker
    private readonly kafka = new Kafka({
        brokers: [this.configService.get<string>('KAFKA_BROKER')],
        clientId: this.configService.get<string>('KAFKA_CLIENT_ID')
    });

    // Store available consumers
    private readonly consumers: Consumer[] = [];

    async consume(topics: ConsumerSubscribeTopics, config: ConsumerRunConfig){
        const consumer = this.kafka.consumer({groupId: 'nestjs-kafka'});
        await consumer.connect();
        await consumer.subscribe(topics);
        await consumer.run(config);
        this.consumers.push(consumer);
    }

    async onApplicationShutdown(){
        for (const consumer of this.consumers) {
            await consumer.disconnect();
        }
    }
}
