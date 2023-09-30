import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { KafkaMessage } from 'kafkajs';
import { ShiftDto } from '../../shift/dto/Shift.dto';
import { ShiftService } from '../../shift/shift.service';
import { ConsumerService } from './consumer.service';
import { Server } from 'socket.io';
import { DepartmentService } from '../../department/department.service';
import { DepartmentforDashboardDto } from '../../department/dto/DepartmentforDashboard.dto';
import { RequestService } from '../../relations/request/request.service';
const moment = require('moment');

@Injectable()
export class ProductConsumer implements OnModuleInit {
    constructor(
        private readonly consumerService: ConsumerService,
        private readonly configService: ConfigService,
        private readonly shiftService: ShiftService,
        private readonly departmentService: DepartmentService,
        private readonly requestService: RequestService,
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
        //Get shift detail data
        const shift: ShiftDto = await this.shiftService.getShiftById(value.shift_code);

        //////// Prepare update parameter model/////////
        delete shift.actual_performance;
        const updatedShift = { ...shift };
        ///////////////////////////////////////////////

        // Update success_product
        ///// Find max accepted ot request time because it the end time of this shift //////////
        const request_list = await this.requestService.getAllRequestByShift_id(value.shift_code)
        const shift_OT_time = request_list.filter((req)=>req.req_status==="ยอมรับ").length!=0?Math.max(...request_list.filter((req)=>req.req_status==="ยอมรับ").map((req)=>req.number_of_hour)):0
        ///////////////////////////////////////////////////////////////////////////////////////

        const shift_start_time = moment(`${moment(shift.date).format("YYYY-MM-DD")} ${shift.shift_time}`, "YYYY-MM-DD HH:mm:ss") // Shift start time
        const shift_plan_end_time = moment(`${moment(shift.date).format("YYYY-MM-DD")} ${shift.shift_time}`, "YYYY-MM-DD HH:mm:ss").add(8,'hours') // Shift end time (Exclude OT time)
        const shift_OT_end_time = moment(`${moment(shift.date).format("YYYY-MM-DD")} ${shift.shift_time}`, "YYYY-MM-DD HH:mm:ss").add(8+shift_OT_time,'hours') // shift end time (Include OT time)
        
        //check shift started?
        if(moment().isAfter(shift_start_time) && moment().isBefore(shift_plan_end_time)){
            //if started we will update variable that collect success product that happen in shift time exclude ot time
                
            updatedShift.success_product_in_shift_time =
                (
                    (+updatedShift.success_product_in_shift_time) + 
                    (+value.success_product)
                )
                .toString();
        }else if(moment().isAfter(shift_plan_end_time) && moment().isBefore(shift_OT_end_time)){
            
            //if on OT_time we will update variable that collect success product that happen in ot time
            updatedShift.success_product_in_OT_time =
                (
                    (+updatedShift.success_product_in_OT_time) + 
                    (+value.success_product)
                )
                .toString();
        }
        
        // Update to database
        await this.shiftService.updateShift(updatedShift);

        // Notices to client
         //Get department detail data
        const department: DepartmentforDashboardDto = await this.departmentService.getDepartmentById(updatedShift.department_id)
        //Push message to websocket to trigger frontend side of department's manager to fetch new data
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
