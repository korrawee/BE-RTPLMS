import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { KafkaMessage } from 'kafkajs';
import { ShiftDto } from 'src/shift/dto/Shift.dto';
import { ShiftService } from '../../shift/shift.service';
import { ConsumerService } from './consumer.service';
import { Server } from 'socket.io';
import { DepartmentService } from 'src/department/department.service';
import { DepartmentforDashboardDto } from 'src/department/dto/DepartmentforDashboard.dto';

@Injectable()
export class ProductConsumer implements OnModuleInit {
    constructor(
        private readonly consumerService: ConsumerService,
        private readonly configService: ConfigService,
        private readonly shiftService: ShiftService,
        private readonly departmentService: DepartmentService,
    ) {}

    socketServer: Server;
    
    async onModuleInit() {
        console.log('init product consumer')
        await this.consumerService.consume(
            {
                topics: [
                    this.configService.get<string>('UPDATE_PRODUCT_TOPIC'),
                ],
            },
            {
                eachMessage: async ({ topic, partition, message }) => {
                    // handle each messages here
                    await this.doUpdate(message);
                },
            },
            'consume-product'
        );
    }

    async doUpdate(message: KafkaMessage) {
        // Prep. data
        const value: { shift_code: string; success_product: number } =
            JSON.parse(message.value.toString());
        const shift: ShiftDto = await this.shiftService.getShiftById(value.shift_code);
        const updatedShift = { ...shift };

        // Update success_product
        updatedShift.success_product =
            +updatedShift.success_product + +value.success_product;

        // Update to database
        await this.shiftService.updateShift(updatedShift);

        // Notices to client
        const department: DepartmentforDashboardDto = await this.departmentService.getDepartmentById(updatedShift.department_id)
        if(this.sendNoticeToClient(department.mng_id)){
            console.log('Update consumed product successfully.');
        }else{
            console.log('Something wrong while sending notification to client.');
        }
    }

    private sendNoticeToClient(target: string) {
        const topic = `${target}-product`;
        return this.socketServer.emit(topic,{isUpdate: true});
    }
    
}
