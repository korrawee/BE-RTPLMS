import { BadRequestException, Injectable } from '@nestjs/common';
import { Client } from 'pg';
import { InjectClient } from 'nest-postgres';
import { dbResponse } from '../../db/db.response.type';
import { WorkPlanSchedule } from './dto/WorkPlanSchedule.dto';
import { OtPlanSchedule } from './dto/OtPlanSchedule.dto';

@Injectable()
export class ScheduleService {
    constructor(@InjectClient() private readonly cnn: Client) {}

    async getScheduleByAccountId(accId: string) {
        // Is account id a integer

        if (!Number.isInteger(parseInt(accId)))
            throw new BadRequestException('Invalid account id.');

        const query = `
            WITH
            w as (
                    SELECT * 
                    FROM work_on 
                    where account_id='3'
                    ),
            w_to_s as (
                    SELECT w.*, 
                    CASE
                            WHEN checkin_time <= s.shift_time THEN 'ปกติ'
                            WHEN checkin_time > s.shift_time THEN 'สาย'
                            WHEN checkin_time IS NULL THEN 'ยังไม่เข้างาน'
                            ELSE 'ยังไม่เข้างาน'
                    END AS checkin_status,
                    s.shift_time 
                    FROM shifts AS s 
                    INNER JOIN w 
                    ON s.shift_code=w.shift_code
                    ), 
            s_to_c as (
                    SELECT w_to_s.*, c.department_id 
                    FROM _controls AS c 
                    INNER JOIN w_to_s 
                    ON w_to_s.shift_code=c.shift_code
                    ), 
            s_to_c_to_d as (
                    SELECT s_to_c.*, d.name
                    FROM departments AS d 
                    INNER JOIN s_to_c 
                    ON d.department_id=s_to_c.department_id
                    )
            SELECT prev.name AS department_name, prev.checkin_time, prev.checkout_time, prev.checkin_status, prev.shift_time, prev.date
            FROM s_to_c_to_d as prev
            INNER JOIN accounts as a 
            ON a.account_id=prev.account_id;
        `;

        const workPlanSchedule: WorkPlanSchedule[] = await this.cnn
            .query(query)
            .then((res: dbResponse) => {
                return res.rows;
            })
            .catch((e) => {
                throw new BadRequestException(e.message);
            });

        return workPlanSchedule;
    }

    async getOtScheduleByAccountId(accId: string) {
        // Is account id a integer
        if (!Number.isInteger(parseInt(accId)))
            throw new BadRequestException('Invalid account id.');

        const query = `
            WITH
            r as (
                SELECT *
                FROM requests
                WHERE account_id='${accId}'
            ),
            to_s as (
                SELECT prev.*, s.shift_time
                FROM r AS prev
                INNER JOIN shifts AS s
                ON prev.shift_code=s.shift_code
            ),
            to_c as (
                SELECT prev.*, c.department_id
                FROM to_s AS prev
                INNER JOIN _controls AS c
                ON prev.shift_code=c.shift_code
            ),
            to_d as (
                SELECT prev.*, d.name AS department_name
                FROM to_c AS prev
                INNER JOIN departments AS d
                ON prev.department_id=d.department_id
            )
            SELECT prev.date, prev.shift_time, prev.number_of_hour, prev.req_status, prev.create_at, prev.department_name
            FROM to_d AS prev;
        `;
        const otSchedule: OtPlanSchedule = await this.cnn
            .query(query)
            .then((res: dbResponse) => {
                return res.rows;
            })
            .catch((e) => {
                throw new BadRequestException(e.message);
            });
        return otSchedule;
    }
}
