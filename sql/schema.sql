DROP SCHEMA IF EXISTS public CASCADE;

CREATE SCHEMA public;

SET search_path = public;

CREATE TABLE accounts(
        account_id text primary key,
        username text not null,
        password text,
        fullname text,
        role text not null,
        telephone text,
        performance numeric not null,
        details json,
        mng_id text references accounts(account_id)
);

