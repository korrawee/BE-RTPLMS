const fs = require('fs');
const { Pool } = require('pg');
const { exec } = require('child_process');
const util = require('util');
const { promisify } = util;
require('dotenv').config({ path: './.development.env' });
const dataset_dir_path = './data_set';
const moment = require('moment');
const { randomInt } = require('crypto');

// Set up the connection to the PostgreSQL database
const pool = new Pool({
    user: process.env.POSTGRES_USER,
    host: process.env.POSTGRES_HOST,
    database: process.env.POSTGRES_DB,
    password: process.env.POSTGRES_PASSWORD.toString(),
    port: process.env.POSTGRES_PORT, // or the port number of your PostgreSQL server
});

const mawhang_data = {
    account_id:"12-3456-78",
    username: "worker",
    password:"123",
    full_name:"Mawhang Khompee",
    role:"worker",
    performance:10,
    details:{
        telephone: "012-345-6789",
        address: "12/3 Bonking khangton 1111",
        gender: "Male",
        race: "Asian",
        email: "Mawhangzaa@kingkongkhaw.com",
    },
    mng_id: '29-6308534'
}

const seed_DB = async () => {
    const { stdout, stderr } = await promisify(exec)('./scripts/run-seed.sh');
    console.log('stdout:', stdout);
    console.log('stderr:', stderr);

    //Managers
    const managersRawData = fs.readFileSync(
        `${dataset_dir_path}/Managers.json`
    );
    const managerData = JSON.parse(managersRawData);
    const insertManager = async () => {
        const insertManagerQuery = `INSERT INTO accounts VALUES (
                                    $1,
                                    $2,
                                    $3,
                                    $4,
                                    $5,
                                    $6,
                                    $7,
                                    NULL
                                );`;
        for (const row_data of managerData) {
            await client.query(insertManagerQuery, [
                row_data.account_id,
                row_data.username,
                row_data.password,
                row_data.full_name,
                'manager',
                10,
                {
                    telephone: row_data.telephone,
                    address: row_data.address,
                    gender: row_data.gender,
                    race: row_data.race,
                    email: row_data.email,
                },
            ]);
        }
    };

    //Accounts
    const accountRawData = fs.readFileSync(`${dataset_dir_path}/Accounts.json`);
    const accountData = JSON.parse(accountRawData);
    const insertAccount = async () => {
        const insertAccountQuery = `INSERT INTO accounts VALUES (
                                  $1,
                                  $2,
                                  $3,
                                  $4,
                                  $5,
                                  CAST($6 as numeric),
                                  $7,
                                  $8
                                );`;
        for (const row_data of accountData) {
            await client.query(insertAccountQuery, [
                row_data.account_id,
                row_data.username,
                row_data.password,
                row_data.full_name,
                'worker',
                10,
                {
                    telephone: row_data.telephone,
                    address: row_data.address,
                    gender: row_data.gender,
                    race: row_data.race,
                    email: row_data.email,
                },
                row_data.mng_id,
            ]);
        }
        await client.query(insertAccountQuery,[
            mawhang_data.account_id,
            mawhang_data.username,
            mawhang_data.password,
            mawhang_data.full_name,
            mawhang_data.role,
            mawhang_data.performance,
            mawhang_data.details,
            mawhang_data.mng_id
        ])
    };

    //Factory
    const factoryRawData = fs.readFileSync(`${dataset_dir_path}/Factory.json`);
    const factoryData = JSON.parse(factoryRawData);
    const insertFactory = async () => {
        const insertFactoryQuery = `INSERT INTO factories VALUES (
                                  $1,
                                  $2,
                                  $3
                                );`;
        for (const row_data of factoryData) {
            await client.query(insertFactoryQuery, [
                row_data.factory_id,
                row_data.factory_name,
                row_data.mng_id,
            ]);
        }
    };

    //Department
    const departmentRawData = fs.readFileSync(
        `${dataset_dir_path}/Departments.json`
    );
    const departmentData = JSON.parse(departmentRawData);
    const insertDepartment = async () => {
        const insertDepartmentQuery = `INSERT INTO departments VALUES (
                                  $1,
                                  $2,
                                  $3,
                                  $4
                                );`;
        for (const row_data of departmentData) {
            await client.query(insertDepartmentQuery, [
                row_data.department_id,
                row_data.department_name,
                row_data.mng_id,
                row_data.factory_id,
            ]);
        }
    };

    //Shift
    const shiftsRawData = fs.readFileSync(`${dataset_dir_path}/shifts.json`);
    const shiftData = JSON.parse(shiftsRawData);
    const insertShift = async () => {
        const insertShiftQuery = `INSERT INTO shifts VALUES (
                                  $1,
                                  CAST($2 as  date),
                                  to_timestamp($3, 'HH24.MI'),
                                  CAST($4 as numeric),
                                  CAST($5 AS numeric),
                                  CAST($6 AS numeric),
                                  CAST($7 AS numeric),
                                  CAST($8 AS numeric),
                                  CAST($9 AS numeric),
                                  $10
                                );`;
        for (const row_data of shiftData) {
            await client.query(insertShiftQuery, [
                row_data.shift_code,
                row_data.date,
                row_data.shift_time,
                1000,
                500.0,
                0.0,
                50.0,
                7,
                5,
                row_data.department_id,
            ]);
        }
    };

    //Work_on and logs for work_on
    const work_onRawData = fs.readFileSync(`${dataset_dir_path}/work_on.json`);
    const work_onData = JSON.parse(work_onRawData);
    const insertWork_on = async () => {
        const insertWork_onQuery = `INSERT INTO work_on VALUES (
                                $1,
                                $2,
                                to_timestamp($3, 'HH24.MI'),
                                $4,
                                CAST($5 as numeric),
                                $6
                              );`;
        const insertLogQuery = `INSERT INTO logs(mng_id, action, details, create_at) VALUES (
                              $1,
                              $2,
                              $3,
                              to_timestamp($4, 'MM/DD/YYYY')
                            );`;
        let couter = 1
        for (const row_data of work_onData) {
            await client.query(insertWork_onQuery, [
                row_data.account_id,
                row_data.shift_code,
                moment(row_data.checkin_time, 'HH:mm:ss').add(randomInt(-20,30),'minutes').format("HH:mm:ss"),
                null,
                0.0,
                row_data.date,
            ]);
            await client.query(insertLogQuery, [
                row_data.mng_id,
                'Add Worker',
                {
                    department_id: row_data.department_id,
                    department_name: row_data.department_name,
                    account_id: row_data.account_id,
                },
                row_data.date,
            ]);
            if(parseInt(row_data.shift_code)%18 == 1 && couter++ < 8){
                await client.query(insertWork_onQuery,[
                    mawhang_data.account_id,
                    row_data.shift_code,
                    moment(row_data.checkin_time, 'HH:mm:ss').add(randomInt(-20,30),'minutes').format("HH:mm:ss"),
                    null,
                    0.0,
                    row_data.date
                ])
            }
        }
    };

    //Request and logs for request
    const requestRawData = fs.readFileSync(`${dataset_dir_path}/requests.json`);
    const requestData = JSON.parse(requestRawData);
    const insertRequest = async () => {
        const insertWork_onQuery = `INSERT INTO requests VALUES (
                                $1,
                                $2,
                                cast($3 as date),
                                $4,
                                $5,
                                $6,
                                cast($7 as timestamp)
                              );`;
        const insertLogQuery = `INSERT INTO logs(mng_id, action, details, create_at) VALUES (
                              $1,
                              $2,
                              $3,
                              to_timestamp($4, 'MM/DD/YYYY')
                            );`;
        for (const row_data of requestData) {
            await client.query(insertWork_onQuery, [
                row_data.shift_code,
                row_data.account_id,
                row_data.date,
                row_data.number_of_hour ? row_data.number_of_hour : 4,
                'รอดำเนินการ',
                row_data.mng_id,
                row_data.date,
            ]);
            await client.query(insertLogQuery, [
                row_data.mng_id,
                'Add OT',
                {
                    department_id: row_data.department_id,
                    department_name: row_data.department_name,
                    account_id: row_data.account_id,
                    number_of_hour: row_data.number_of_hour
                        ? row_data.number_of_hour
                        : 4,
                },
                row_data.date,
            ]);
        }
    };

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        await insertManager();
        await insertAccount();
        await insertFactory();
        await insertDepartment();
        await insertShift();
        await insertWork_on();
        await insertRequest();

        await client.query('COMMIT');
    } catch (e) {
        await client.query('ROLLBACK');
        throw e;
    } finally {
        client.release();
        await client.end();
    }
};
seed_DB();
