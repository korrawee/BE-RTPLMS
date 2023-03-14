import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { KafkaMessage } from 'kafkajs';
import { ShiftDto } from 'src/shift/dto/Shift.dto';
import { ShiftService } from '../../shift/shift.service';
import { ConsumerService } from './consumer.service';
import { Server } from 'socket.io';
import { DepartmentService } from 'src/department/department.service';
import { DepartmentforDashboardDto } from 'src/department/dto/DepartmentforDashboard.dto';
import { WorkOnService } from 'src/relations/work-on/work-on.service';
import { WorkOnDto } from 'src/relations/work-on/dto/WorkOn.dto';

interface IUpdateAttendance {
    account_id: string;
    shift_code: string;
    checkin_time?: string;
    checkout_time?: string;
}

@Injectable()
export class AttendanceConsumer implements OnModuleInit {
    constructor(
        private readonly consumerService: ConsumerService,
        private readonly configService: ConfigService,
        private readonly shiftService: ShiftService,
        private readonly departmentService: DepartmentService,
        private readonly workOnService: WorkOnService,
    ) {}

    socketServer: Server;
    
    async onModuleInit() {
        console.log('init attendance consumer')
        await this.consumerService.consume(
            {
                topics: [
                    this.configService.get<string>('UPDATE_ATTENDANCE_TOPIC'),
                ],
            },
            {
                eachMessage: async ({ topic, partition, message }) => {
                    // handle each messages here
                    await this.doUpdate(message);
                },
            },
            'consume-attendance'
        );
    }

    async doUpdate(message: KafkaMessage) {
        
        // Prep. data
        const payload: IUpdateAttendance =
            JSON.parse(message.value.toString());
        console.log('payload',payload);
        const workOnOld: WorkOnDto = await this.workOnService.getOneWorkOn(payload.account_id, payload.shift_code);
        // Update attendace
        const workOnUpdated: WorkOnDto = await this.workOnService.update(payload);
        const shift: ShiftDto = await this.shiftService.getShiftById(workOnUpdated.shift_code);

        if(!workOnOld.checkin_time && workOnUpdated.checkin_time){
            await this.shiftService.updateShift({...shift, checkin_member: shift.checkin_member + 1});
        }else{
            await this.shiftService.updateShift({...shift})
        }
        console.log('shift', shift);
        
        const department: DepartmentforDashboardDto = await this.departmentService.getDepartmentById(shift.department_id);
        console.log('departmetn', department)
   
        // Notices to client
        if(this.sendNoticeToClient(department.mng_id)){
            console.log('Update consumed attendance successfully.');
        }else{
            console.log('Something wrong while sending notification to client.');
        }
    }

    private sendNoticeToClient(target: string) {
        const topic = `${target}-attendance`;
        return this.socketServer.emit(topic,{isUpdate: true});
    }
    
}
