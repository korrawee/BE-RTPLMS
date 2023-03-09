import { BadRequestException, ConsoleLogger, Injectable } from '@nestjs/common';
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
    constructor(@InjectClient() private readonly cnn: Client) {}

    async getShiftsById(
        departmentsId: string[],
        date = moment().format('YYYY-MM-DD')
    ) {
        const result: Promise<ShiftforDashboardDto[]> = Promise.all(
            departmentsId.map(async (departmentId: string) => {
                const query: string = `
                SELECT shift_code 
                FROM _controls 
                WHERE department_id='${departmentId}';
            `;

                const shiftInDepartment: ShiftforDashboardDto = await this.cnn
                    .query(query)
                    .then(async (res: dbResponse) => {
                        return await this.getshifts(res.rows, date).then(
                            (res) => res
                        );
                    })
                    .catch((error) => {
                        console.error(error);
                        throw new BadRequestException('Invalid input data');
                    });
                return shiftInDepartment;
            })
        );

        //
        return await result;
    }

    public async getshifts(
        shiftInDepartment: ShiftInDepartmentDto[],
        date: string
    ) {
        const data: Promise<ShiftforDashboardDto[]> = Promise.all(
            shiftInDepartment.map(async (obj: ShiftInDepartmentDto) => {
                // return Promise.all(shiftInDepartment.map(async (obj: ShiftInDepartmentDto) => {
                const query = `
                            SELECT *
                            FROM shifts 
                            WHERE shift_code='${+obj.shift_code}'
                            AND date='${date}'
                        ;
                        `;
                const shift = await this.cnn
                    .query(query)
                    .then((res: dbResponse) => {
                        return res.rows.pop();
                    })
                    .then((shift: ShiftforDashboardAttrDto) => {
                        const res: ShiftforDashboardDto = {
                            shiftCode: shift.shift_code,
                            shiftDate: moment(shift.date).format('YYYY/MM/DD'),
                            shiftTime: shift.shift_time,
                            successProduct: shift.success_product,
                            allMember: shift.all_member,
                            checkInMember: shift.checkin_member,
                            idealPerformance: shift.ideal_performance,
                        };

                        return res;
                    })
                    .catch((error) => {
                        console.error(error);
                        throw new BadRequestException('Invalid input data');
                    });

                return shift;
            })
        );
        // .then(res=>{

        //     return res;
        // });

        return data.then((res) => res);
    }

    public async getShiftTimeById(shiftCode: string) {
        const query = `
            SELECT shift_time
            FROM shifts 
            WHERE shift_code='${shiftCode}';
        `;
        //
        const requestWithWorkTime: { shift_time: string } = await this.cnn
            .query(query)
            .then((res: dbResponse) => {
                //
                return res.rows.pop();
            })
            .catch((e) => {
                throw new BadRequestException('Invalid input Data');
            });

        return requestWithWorkTime;
    }

    public async getShiftById(shiftCode: string) {
        const query = `
            SELECT *
            FROM shifts
            WHERE shift_code='${shiftCode}'
            ;
        `;

        const shift: ShiftDto = await this.cnn
            .query(query)
            .then((res: dbResponse) => {
                return res.rows.pop();
            })
            .catch((e) => {
                throw new BadRequestException('Invalid input Data');
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
                // const d = new Date(val);
                // val = `'${d.getFullYear()}-${d.getMonth()}-${d.getDate()}'`;
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
                return res.rows.pop();
            })
            .catch((e) => {
                throw new BadRequestException('Invalid input Data');
            });

        return shift;
    }
}
