import { BadRequestException, Injectable } from '@nestjs/common';
import { dbResponse } from '../db/db.response.type';
import { ShiftforDashboardDto } from './dto/ShiftForDashboard.dto';
import { ShiftforDashboardAttrDto } from './dto/ShiftForDashboardAttr.dto';
import { ShiftInDepartmentDto } from './dto/ShiftInDepartment.dto';
import { Client } from 'pg';
import { InjectClient } from 'nest-postgres';
import { UpdateShiftDto } from './dto/UpdateShift.dto';
import { ShiftDto } from './dto/Shift.dto';
import moment = require('moment');

@Injectable()
export class ShiftService {
    constructor(
        @InjectClient() private readonly cnn: Client,
    ) {}

    async getShiftsById(
        departmentsId: string[],
        date: string = moment().format('YYYY-MM-DD')
    ) {
        const result: Promise<ShiftforDashboardDto[]> = Promise.all(
            departmentsId.map(async (departmentId: string) => {
                const query: string = `
                SELECT shift_code 
                FROM shifts 
                WHERE department_id='${departmentId}';
            `;

                const shiftInDepartment: ShiftforDashboardDto = await this.cnn
                    .query(query)

                    .then(async (res: dbResponse) => {
                        return await this.getshifts(res.rows, date).then(
                            (res) => res
                        );
                    })
                    .catch((e) => {
                        console.error(e);
                        throw new BadRequestException(e.message);
                    });
                return shiftInDepartment;
            })
        );

        return await result;
    }

    public async getshifts(
        shiftInDepartment: ShiftInDepartmentDto[],
        date: string
    ) {
        const data: Promise<ShiftforDashboardDto[]> = Promise.all(
            shiftInDepartment.map(async (obj: ShiftInDepartmentDto) => {
                const query = `
                            SELECT *
                            FROM shifts 
                            WHERE shift_code='${+obj.shift_code}'
                            AND date='${date}'
                        `;
                const shift = await this.cnn
                    .query(query)
                    .then((res: dbResponse) => {
                        if (res.rows.length == 0)
                            return
                            // throw new Error('No current shift.');
                        return res.rows.pop();
                    })
                    .then((shift: ShiftforDashboardAttrDto) => {
                        if (!shift){
                            return null
                        }
                        const res: ShiftforDashboardDto = {
                            shiftCode: shift.shift_code,
                            shiftDate: moment(shift.date).format('YYYY/MM/DD'),
                            shiftTime: shift.shift_time,
                            product_target: shift.product_target,
                            success_product_in_shiftTime: shift.success_product_in_shift_time,
                            success_product_in_OTTime: shift.success_product_in_ot_time,
                            allMember: shift.all_member,
                            checkInMember: shift.checkin_member,
                            idealPerformance: shift.ideal_performance,
                            actual_performance: 
                            moment(`${moment(shift.date).format("YYYY-MM-DD")} ${shift.shift_time}`,"YYYY-MM-DD HH:mm:ss").add(8,"hours").isAfter(moment())?
                                shift.success_product_in_shift_time/moment.duration(moment().diff(moment(`${moment(shift.date).format("YYYY-MM-DD")} ${shift.shift_time}`,"YYYY-MM-DD HH:mm:ss"))).asHours()
                            :
                                shift.success_product_in_ot_time/moment.duration(moment().diff(moment(`${moment(shift.date).format("YYYY-MM-DD")} ${shift.shift_time}`,"YYYY-MM-DD HH:mm:ss").add(8,"hours"))).asHours(),
                        };

                        return res;
                    })
                    .catch((e) => {
                        console.error(e);
                        throw new BadRequestException(e.message);
                    });

                return shift;
            })
        );
        // .then(res=>{

        //     return res;
        // });

        return data.then((res)=>res.filter((shift)=> (shift!=null)));
    }

    public async getShiftTimeById(shiftCode: string) {
        const query = `
            SELECT shift_time
            FROM shifts 
            WHERE shift_code='${shiftCode}';
        `;
        const requestWithWorkTime: { shift_time: string } = await this.cnn
            .query(query)
            .then((res: dbResponse) => {
                return res.rows.pop();
            })
            .catch((e) => {
                throw new BadRequestException(e.message);
            });

        return requestWithWorkTime;
    }

    public async getShiftById(shiftCode: string): Promise<ShiftDto> {
        const query = `
            SELECT *
            FROM shifts
            WHERE shift_code='${shiftCode}'
            ;
        `;

        const shift: ShiftDto = await this.cnn
            .query(query)
            .then(async (res: dbResponse) => {
                const shift_data = await res.rows[0]
                const formatted_shift = {
                    shift_code: shift_data.shift_code,
                    date: shift_data.date,
                    shift_time: shift_data.shift_time,
                    product_target: shift_data.product_target,
                    success_product_in_shift_time: shift_data.success_product_in_shift_time,
                    success_product_in_OT_time: shift_data.success_product_in_ot_time,
                    ideal_performance: shift_data.ideal_performance,
                    actual_performance: 
                    moment(`${moment(shift_data.date).format("YYYY-MM-DD")} ${shift_data.shift_time}`,"YYYY-MM-DD HH:mm:ss").add(8,"hours").isAfter(moment())?
                        parseFloat(shift_data.success_product_in_shift_time)/moment.duration(moment().diff(moment(`${moment(shift_data.date).format("YYYY-MM-DD")} ${shift_data.shift_time}`,"YYYY-MM-DD HH:mm:ss"))).asHours()
                    :
                        parseFloat(shift_data.success_product_in_ot_time)/moment.duration(moment().diff(moment(`${moment(shift_data.date).format("YYYY-MM-DD")} ${shift_data.shift_time}`,"YYYY-MM-DD HH:mm:ss").add(8,"hours"))).asHours(),
                    all_member: shift_data.all_member,
                    checkin_member: shift_data.checkin_member,
                    department_id: shift_data.department_id,
                }
                return formatted_shift;
            })
            .catch((e) => {
                throw new BadRequestException(e.message);
            });
        return shift;
    }

    public async updateShift(body: UpdateShiftDto) {
        const lastIndexCol = Object.keys(body).length - 1;
        const columns = Object.keys(body).reduce((str, col, currentIndex) => {
            return str + (currentIndex == lastIndexCol ? col : col + ',');
        }, '');

        const lastIndexVal = Object.values(body).length - 1;
        const values = Object.values(body).reduce((str, val, currentIndex) => {
            if (typeof val === 'string') {
                val = `'${val}'`;
            } else if (typeof val === 'object') {
                val = moment(val).format("'YYYY-MM-DD'");
            } else {
            }
            return str + (currentIndex == lastIndexVal ? val : val + ',');
        }, '');

        const query = `
            UPDATE shifts
            SET (${columns}) = (${values})
            WHERE shift_code='${body.shift_code}'
            RETURNING *
        ;`;

        const shift = await this.cnn
            .query(query)
            .then((res: dbResponse) => {
                const shift: ShiftDto = res.rows.pop();
                return shift;
            })
            .catch((e) => {
                throw new BadRequestException(e.message);
            });

        return shift;
    }
}
