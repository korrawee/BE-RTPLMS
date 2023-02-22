import { Injectable, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { KafkaMessage } from "kafkajs";
import { ShiftService } from "src/shift/shift.service";
import { ConsumerService } from "./consumer.service";

@Injectable()
export class ProductConsumer implements OnModuleInit {
    constructor(
        private readonly consumerService: ConsumerService,
        private readonly configService: ConfigService,
        private readonly shiftService: ShiftService
    ){}

    async onModuleInit() {
        await this.consumerService.consume(
            {
                topics: [this.configService.get<string>('UPDATE_PRODUCT_TOPIC')]
            },
            {
                eachMessage: async ({topic, partition, message}) => {
                    
                    // handle each messages here
                    console.log({
                        value: JSON.parse(message.value.toString()),
                        topic: topic.toString(),
                        partition: partition.toString()
                    })

                    await this.doUpdate(message);

                }
            }
        )
    }

    async doUpdate(message: KafkaMessage){
        // Prep. data
        const value: {shift_code: string; success_product: number} = JSON.parse(message.value.toString());
        const shift = await this.shiftService.getShiftById(value.shift_code);
        const updatedShift = {...shift};

        // Update success_product
        updatedShift.success_product = (+updatedShift.success_product) + (+value.success_product)

        // Update to database
        await this.shiftService.updateShift(updatedShift);
        console.log('Update consumed data successfully.');
    }
}