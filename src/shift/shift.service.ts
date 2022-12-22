import { Inject, Injectable } from '@nestjs/common';
import { PG_CONNECTION } from '../constants';
import { dbResponse } from 'src/db/db.response.type';
import { ShiftforDashboardDto } from './dto/ShiftForDashboard.dto';
import { ShiftforDashboardAttrDto } from './dto/ShiftForDashboardAttr.dto';
import { ShiftInDepartmentDto } from './dto/ShiftInDepartment.dto';

@Injectable()
export class ShiftService {
    constructor(@Inject(PG_CONNECTION) private readonly cnn: any){}

    async getShiftsById(departmentId: string){
        const query: string = `select shift_code from _controls where department_id='${departmentId}'`;
        const shiftInDepartment: ShiftforDashboardDto[] = await this.cnn.query(query)
        .then(async (res: dbResponse) => {
            return await this.getshifts(res.rows);
        })
        .catch((error) => {
            console.error(error);
            return {status: 200, message: error.message};
        });

        return shiftInDepartment
    }

    private async getshifts(shiftInDepartment: ShiftInDepartmentDto[]) {
        
        const data: Promise<ShiftInDepartmentDto[]> = Promise.all(shiftInDepartment.map(async (obj: ShiftInDepartmentDto) => {
            const query = `
                            select shift_code, success_product,
                            all_member, checkin_member
                            from shifts 
                            where shift_code='${+obj.shift_code}'
                        `
            const shift =  await this.cnn.query(query)
                .then((res: dbResponse) => {
                    return res.rows.pop();
                    // [
                    //     {}
                    // ]
                })
                .then((shift: ShiftforDashboardAttrDto) => ({
                    shiftCode: shift.shift_code,
                    successProduct: shift.success_product,
                    allMember: shift.all_member,
                    checkInMember: shift.checkin_member,
                }))
                .catch((error) => {
                    console.error(error);
                    return {status: 200, message: error.message};
                });
            return shift
        }));

        return data;
    }
}
