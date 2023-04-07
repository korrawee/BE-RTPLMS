import { Body, Controller, Post } from '@nestjs/common';
import { ProducerRecord } from 'kafkajs';
import { ProducerService } from './producer.service';

@Controller('produce')
export class ProducerController {
    constructor(private readonly producerService: ProducerService) {}

    @Post()
    async publishData(@Body() body: ProducerRecord) {
        return await this.producerService.produce(body);
    }
}
