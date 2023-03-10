do $$
declare
    index integer := 1;
begin
    INSERT INTO accounts VALUES (
        '0',
        concat('user', cast(0 AS text)),
        '1234',
        concat('full-name', cast(0 AS text)),
        'manager',
        '0981',
        12.0,
        '{"data": "eiei"}', 
        NULL
    );

    
    WHILE index <50 LOOP
        INSERT INTO accounts VALUES (
            index,
            concat('user', cast(index AS text)),
            '1234',
            concat('Worker No.', cast(index AS text)),
            'worker',
            '0981',
            12.0,
            '{"data": "eiei"}', 
            '0'
        );
        index := index + 1;
    END LOOP;

    INSERT INTO factories VALUES ('1', 'latprao', '0');

    INSERT INTO departments VALUES ('1', 'Boiling', '0', '1');
    INSERT INTO departments VALUES ('2', 'Packing', '0', '1');
    INSERT INTO departments VALUES ('3', 'Logistic', '0', '1');
    INSERT INTO departments VALUES ('4', 'Stock', '0', '1');
    INSERT INTO departments VALUES ('5', 'Boiling 2', '0', '1');
    INSERT INTO departments VALUES ('6', 'Packing 2', '0', '1');
    INSERT INTO departments VALUES ('7', 'Logistic 2', '0', '1');

    index := 1;
    WHILE index <22 LOOP
    INSERT INTO shifts VALUES (
        index, 
        cast(now() as date), 
        to_timestamp(concat(cast(8*((index-1)%3) AS text),':00:00'), 'HH24:MI:SS'), 
        500, 
        400, 
        300, 
        30, 
        15,
        (index % 7) + 1
    );

        index := index + 1;
    END LOOP;


        INSERT INTO work_on VALUES(2, 1, '07:00', NULL, NULL, cast(now() as date));
        INSERT INTO logs(mng_id, action, details) VALUES ('0', 'ADD', '{"department_id":"1", "department_name":"ต้มไก่", "account_id": "2"}');
        INSERT INTO work_on VALUES(3, 1, '08:00', NULL, NULL, cast(now() as date));
        INSERT INTO logs(mng_id, action, details) VALUES ('0', 'ADD', '{"department_id":"1", "department_name":"ต้มไก่", "account_id": "3"}');
        INSERT INTO work_on VALUES(4, 1, '08:01', NULL, NULL, cast(now() as date));
        INSERT INTO logs(mng_id, action, details) VALUES ('0', 'ADD', '{"department_id":"1", "department_name":"ต้มไก่", "account_id": "4"}');
        INSERT INTO work_on VALUES(5, 1, NULL, NULL, NULL, cast(now() as date));
        INSERT INTO logs(mng_id, action, details) VALUES ('0', 'ADD', '{"department_id":"1", "department_name":"ต้มไก่", "account_id": "5"}');

        INSERT INTO work_on VALUES(6, 2, '07:45', NULL, NULL, cast(now() as date));
        INSERT INTO logs(mng_id, action, details) VALUES ('0', 'ADD', '{"department_id":"2", "department_name":"ต้มไก่", "account_id": "6"}');
        INSERT INTO work_on VALUES(7, 2, '08:00', NULL, NULL, cast(now() as date));
        INSERT INTO logs(mng_id, action, details) VALUES ('0', 'ADD', '{"department_id":"2", "department_name":"ต้มไก่", "account_id": "7"}');
        INSERT INTO work_on VALUES(8, 2, '08:01', NULL, NULL, cast(now() as date));
        INSERT INTO logs(mng_id, action, details) VALUES ('0', 'ADD', '{"department_id":"2", "department_name":"ต้มไก่", "account_id": "8"}');

        INSERT INTO work_on VALUES(9, 3, '07:45', NULL, NULL, cast(now() as date));
        INSERT INTO work_on VALUES(10, 3, '08:00', NULL, NULL, cast(now() as date));
        INSERT INTO work_on VALUES(11, 3, '08:01', NULL, NULL, cast(now() as date));

        INSERT INTO work_on VALUES(12, 4, '07:45', NULL, NULL, cast(now() as date));
        INSERT INTO work_on VALUES(13, 4, '08:00', NULL, NULL, cast(now() as date));
        INSERT INTO work_on VALUES(14, 4, '08:01', NULL, NULL, cast(now() as date));

        INSERT INTO requests values(1, 3, cast(now() as date), 4, 'รอดำเนินการ', '0');
        INSERT INTO logs(mng_id, action, details) VALUES ('0', 'ADD_OT', '{"department_id":"1", "department_name":"ต้มไก่", "account_id": "3"}');
        INSERT INTO requests values(1, 4, cast(now() as date), 4, 'รอดำเนินการ', '0');
        INSERT INTO logs(mng_id, action, details) VALUES ('0', 'ADD_OT', '{"department_id":"1", "department_name":"ต้มไก่", "account_id": "4"}');
        INSERT INTO requests values(1, 5, cast(now() - INTERVAL '-1 days' as date), 4, 'รอดำเนินการ', '0');
        INSERT INTO logs(mng_id, action, details) VALUES ('0', 'ADD_OT', '{"department_id":"1", "department_name":"ต้มไก่", "account_id": "5"}');

        INSERT INTO requests values(2, 6, cast(now() as date), 4, 'รอดำเนินการ', '0');
        INSERT INTO requests values(2, 7, cast(now() as date), 4, 'รอดำเนินการ', '0');
        INSERT INTO requests values(2, 8, cast(now() - INTERVAL '-1 days' as date), 4, 'รอดำเนินการ', '0');
end$$;
