import { Injectable } from '@nestjs/common';
import { RequestService } from '../../relations/request/request.service';
import { AccountService } from '../../account/account.service';
import { AccountDto } from '../../account/dto/AccountDto';
import { WorkOnDto } from '../../relations/work-on/dto/WorkOn.dto';
import { WorkOnService } from '../../relations/work-on/work-on.service';
import { PersonDetailDto } from './dto/PersonDetail.dto';
import { ShiftService } from '../../shift/shift.service';
const moment = require('moment');

@Injectable()
export class DetailService {
    constructor(
        private readonly accountService: AccountService,
        private readonly workOnService: WorkOnService,
        private readonly requestService: RequestService,
        private readonly shiftService: ShiftService,
    ) {}

    public async getData(shiftCode: string) {
        const workOnThisShift: WorkOnDto[] =
            await this.workOnService.findAllByShiftId(shiftCode);

        const accountIds: Array<string> = workOnThisShift.map(
            (obj: WorkOnDto) => obj.account_id
        );
        const accountOnThisShift: AccountDto[] =
            await this.accountService.findByIds(accountIds);

        if (workOnThisShift.length != accountOnThisShift.length) {
            throw new Error('account and workOn length not match.');
        }

        const response: PersonDetailDto[] = [];

        for (const [index, workOn] of workOnThisShift.entries()) {
            const workOnDate = moment(new Date(workOn.date)).format(
                'YYYY-MM-DD'
            );
            const request: { req_status: string; number_of_hour: number } =
                await this.requestService.getRequest(
                    workOn.shift_code,
                    workOn.account_id,
                    workOnDate
                );

            const person: PersonDetailDto = {
                id: accountOnThisShift[index].account_id,
                name: accountOnThisShift[index].fullname,
                performance: accountOnThisShift[index].performance,
                checkInTime:
                    workOn.checkin_time == null ? '' : workOn.checkin_time,
                checkOutTime:
                    workOn.checkout_time == null ? '' : workOn.checkout_time,
                checkInStatus: workOn.checkin_status,
                otStatus: request?.req_status,
                otDuration: request?.number_of_hour,
            };

            response.push(person);
        }

        return response;
    }

    public async getPrediction(shift_code: string){
        const shift = await this.shiftService.getShiftById(shift_code)
        const request_list = await this.requestService.getAllRequestByShift_id(shift_code)
        const shift_OT_time = request_list.filter((req)=>req.req_status==="ยอมรับ").length!=0?Math.max(...request_list.filter((req)=>req.req_status==="ยอมรับ").map((req)=>req.number_of_hour)):0
        const shift_start_time = moment(`${moment(shift.date).format("YYYY-MM-DD")} ${shift.shift_time}`, "YYYY-MM-DD HH:mm:ss")
        const shift_plan_end_time = moment(`${moment(shift.date).format("YYYY-MM-DD")} ${shift.shift_time}`, "YYYY-MM-DD HH:mm:ss").add(8,'hours')
        const shift_OT_end_time = moment(`${moment(shift.date).format("YYYY-MM-DD")} ${shift.shift_time}`, "YYYY-MM-DD HH:mm:ss").add(8+shift_OT_time,'hours')
        //check shift finished?
        if(moment().isAfter(shift_OT_end_time)){
            //if shift finished
            return {prediction: "จบกะแล้ว"}
        }else{// if not finished
            //Prediction OT product from ideal performance of OT plan
            const ideal_OT_predic_product = await Promise.all(request_list.map(async(req_data)=>{
                if(req_data.req_status=="ยอมรับ"){
                    const performance = await this.accountService.getPerformanceByID(req_data.account_id)
                    return parseFloat(performance)*req_data.number_of_hour
                }else{
                    return 0
                }
            })).then(products => products.reduce((sum, product)=> sum+product,0))
            
            //check shift started?
            if(moment().isBefore(shift_start_time)){
               // Predict by (idealperformance * work_time) formular in work_plan and OT plan of shift
                const workOnThisShift: WorkOnDto[] =
                await this.workOnService.findAllByShiftId(shift_code);
                // Get shift performance
                const performanceArray = await Promise.all(workOnThisShift.map(async (work_on) => {
                    const performance = await this.accountService.getPerformanceByID(work_on.account_id);
                    return performance;
                  }));
                //Predict shift product when finished shift(without OT)
                const ideal_work_plan_product_predicted = performanceArray.reduce((predicted_product, performance) =>
                predicted_product + performance * (moment.duration(shift_plan_end_time.diff(shift_start_time)).asHours()), 0);

                //Prediction
                if(ideal_work_plan_product_predicted+ideal_OT_predic_product>=parseFloat(shift.product_target)){
                  return {prediction:'สำเร็จในเวลา'}
                }else{
                  return {prediction:'ไม่สำเร็จในเวลา'}
                }
            }else{
                //if started
                //Check on shift_time case or on OT_time case
                if(moment().isBefore(shift_plan_end_time)){
                //if on shift_time case
                    
                    //predict in shift time product by (successProduct/shift_time_used)
                    //formular is (Number of success product since shift time started)/(Time used)
                    const actual_performance = (parseFloat(shift.success_product_in_shift_time)/(moment.duration(moment().diff(shift_start_time)).asHours()))
                    //formular is (Predic product)+(Success product from work plan)
                    const work_plan_product_predicted = (actual_performance*(moment.duration(shift_plan_end_time.diff(moment())).asHours()))+parseFloat(shift.success_product_in_shift_time)

                    if(work_plan_product_predicted>=parseFloat(shift.product_target)){
                    return {prediction:'สำเร็จในเวลา'}
                    }else{
                    return {prediction:'ไม่สำเร็จในเวลา'}
                    }
                }else{
                    //if on OT time case
                    //formular is (Number of success product since OT started)/(Time used)
                    const actual_performance = (parseFloat(shift.success_product_in_OT_time)/(moment.duration(moment().diff(shift_plan_end_time)).asHours()))
                    //formular is (Predic product)+(Success product from work plan)+(Success product from OT)
                    const OT_product_predicted = (actual_performance*(moment.duration(shift_OT_end_time.diff(moment())).asHours()))+parseFloat(shift.success_product_in_shift_time)+parseFloat(shift.success_product_in_OT_time)
                    if(OT_product_predicted>=parseFloat(shift.product_target)){
                    return {prediction:'สำเร็จในเวลา'}
                    }else{
                    return {prediction:'ไม่สำเร็จในเวลา'}
                    }
                }
            }
        }
    }
}
