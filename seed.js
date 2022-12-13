const Pool = require('pg').Pool;

//connect to database
const pool = new Pool({
    user: 'korrawee_',
    host: 'localhost',
    database: 'test_seed',
    password: '1234',
    port: 5432,
})

async function tableCreation(){
    //Create accounts table
    pool.query(`CREATE TABLE accounts(
        account_id text primary key,
        username text unique not null,
        password text,
        fullname text,
        role text not null,
        telephone text,
        performance numeric not null,
        details json,
        mng_id text references accounts(account_id)
        )`, (err,results)=>{
            if(err){
                throw err
            }
            //Create shifts table
        pool.query(`CREATE TABLE shifts(
            shift_code text primary key,
            date date not null,
            shift_time time not null,
            product_target numeric,
            success_product numeric default 0.0,
            ideal_performance numeric default 0.0,
            all_member integer,
            checkin_member integer
            )`, (err,results)=>{
                if(err){
                    throw err
                }
                //Create departments table
                pool.query(`CREATE TABLE departments(
                    department_id text primary key,
                    name text not null,
                    mng_id text references accounts(account_id)
                    )`, (err,results)=>{
                        if(err){
                            throw err
                        }
                        //Create factories table
                        pool.query(`CREATE TABLE factories(
                            factory_id text primary key,
                            name text not null,
                            mng_id text references accounts(account_id)
                            )`, (err,results)=>{
                                if(err){
                                    throw err
                                }
                                //Create logs table
                                pool.query(`CREATE TABLE logs(
                                    log_id serial primary key,
                                    create_at timestamp default now(),
                                    action text,
                                    details text,
                                    mng_id text references accounts(account_id)
                                    )`, (err,results)=>{
                                        if(err){
                                            throw err
                                        }
                                         //Create _have table
                                        pool.query(`CREATE TABLE _have(
                                            factory_id text references factories(factory_id),
                                            department_id text references departments(department_id)
                                            )`, (err,results)=>{
                                                if(err){
                                                    throw err
                                                }
                                                //Create _controls table
                                                pool.query(`CREATE TABLE _controls(
                                                    shift_code text references shifts(shift_code),
                                                    department_id text references departments(department_id)
                                                    )`, (err,results)=>{
                                                        if(err){
                                                            throw err
                                                        }
                                                        //Create work_on table
                                                        pool.query(`CREATE TABLE work_on(
                                                            task_id serial primary key,
                                                            account_id text references accounts(account_id),
                                                            shift_code text references shifts(shift_code),
                                                            checkin_time time,
                                                            checkout_time time,
                                                            ot numeric,
                                                            date date
                                                            )`, (err,results)=>{
                                                                if(err){
                                                                    throw err
                                                                }
                                                                //Create requests table
                                                                pool.query(`CREATE TABLE requests(
                                                                    task_id integer references work_on(task_id),
                                                                    account_id text references accounts(account_id),
                                                                    date date,
                                                                    number_of_hour numeric,
                                                                    req_status text,
                                                                    mng_id text references accounts(account_id),
                                                                    create_at timestamp default now()
                                                                    )`, (err,results)=>{
                                                                        if(err){
                                                                            throw err
                                                                        }
                                                                        console.log("Create accounts table success!!")
                                                                    })
                                                            })
                                                    })
                                            })
                                    })
                            })
                    })
            })
        })
}

tableCreation()