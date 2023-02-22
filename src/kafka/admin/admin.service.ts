import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Admin, Kafka } from 'kafkajs';

@Injectable()
export class AdminService implements OnModuleInit{
    constructor(
        private readonly configService: ConfigService
    ){}
    
    // Connect to kafka broker
    private readonly kafka = new Kafka({
        brokers: [this.configService.get<string>('KAFKA_BROKER')]
    });

    // Create admin
    private readonly admin: Admin = this.kafka.admin();

    async onModuleInit() {
        // Uncomment lines below to create initial topics
        this.admin.connect();
        this.createTopics();
        
    }

    async onApplicationShutdown() {
        await this.admin.disconnect();
    }

    async createTopics(){
        const topics: string[] = await this.admin.listTopics();
        
        const topicsSet = new Set(topics);
        console.log(topicsSet);
        const myTopic = this.configService.get<string>('UPDATE_PRODUCT_TOPIC');
        // Check if no myTopic in kafka server
        if(!topicsSet.has(myTopic)){
            // Creates topic
            await this.admin.createTopics({
                topics:[
                    {
                        topic: myTopic
                    }
                ]
            });
        }
        this.admin.disconnect();
    }
}
