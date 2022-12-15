DROP SCHEMA IF EXISTS public CASCADE;

CREATE SCHEMA public;

SET search_path = public;

CREATE TABLE accounts(
        account_id text primary key,
        username text not null, -- add unique in production
        password text,
        fullname text,
        role text not null,
        telephone text,
        performance numeric not null,
        details json,
        mng_id text references accounts(account_id)
);

CREATE TABLE shifts(
        shift_code text primary key,
        date date not null,
        shift_time time not null,
        product_target numeric,
        success_product numeric default 0.0,
        ideal_performance numeric default 0.0,
        all_member integer,
        checkin_member integer
);

CREATE TABLE departments(
        department_id text primary key,
        name text not null,
        mng_id text references accounts(account_id)
);

CREATE TABLE factories(
        factory_id text primary key,
        name text not null,
        mng_id text references accounts(account_id)
);

CREATE TABLE logs(
        log_id serial primary key,
        create_at timestamp default now(),
        action text,
        details text,
        mng_id text references accounts(account_id)
);

CREATE TABLE _have(
        factory_id text references factories(factory_id),
        department_id text references departments(department_id)
);

CREATE TABLE _controls(
        shift_code text references shifts(shift_code),
        department_id text references departments(department_id)
);

CREATE TABLE work_on(
        task_id serial primary key,
        account_id text references accounts(account_id),
        shift_code text references shifts(shift_code),
        checkin_time time,
        checkout_time time,
        ot numeric,
        date date
);

CREATE TABLE requests(
        task_id integer references work_on(task_id),
        account_id text references accounts(account_id),
        date date,
        number_of_hour numeric,
        req_status text,
        mng_id text references accounts(account_id),
        create_at timestamp default now()
);