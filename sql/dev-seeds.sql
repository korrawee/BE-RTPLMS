do $$
declare
    index integer := 2;
begin
    INSERT INTO accounts VALUES (
        '1',
        concat('user', cast(1 AS text)),
        '1234',
        concat('full-name', cast(1 AS text)),
        'manager',
        '0981',
        12.0,
        '{"data": "eiei"}', 
        NULL
    );

    
    WHILE index <10 LOOP
        INSERT INTO accounts VALUES (
            index,
            concat('user', cast(index AS text)),
            '1234',
            concat('full-name', cast(index AS text)),
            'worker',
            '0981',
            12.0,
            '{"data": "eiei"}', 
            '1'
        );
        index := index + 1;
    END LOOP;

    INSERT INTO departments VALUES ('1', 'ต้มไก่', '1');
    INSERT INTO departments VALUES ('2', 'ต้มไก่', '1');

    index := 1;
    WHILE index <10 LOOP
        INSERT INTO shifts VALUES (
            index, 
            cast(now() as date), 
            '08:00:00', 
            500, 
            400, 
            20, 
            30, 
            15
        );

        IF index % 2 = 0 THEN
            INSERT INTO _controls VALUES (index, 1);
        ELSE
            INSERT INTO _controls VALUES (index, 2);
        END IF;

        index := index + 1;
    END LOOP;


        INSERT INTO work_on VALUES(2, 1, '07:00', NULL, NULL, cast(now() as date));
        INSERT INTO logs(mng_id, action, details) VALUES ('1', 'ADD', '{"department_id":"1", "department_name":"ต้มไก่", "account_id": "2"}');
        INSERT INTO work_on VALUES(3, 1, '08:00', NULL, NULL, cast(now() as date));
        INSERT INTO logs(mng_id, action, details) VALUES ('1', 'ADD', '{"department_id":"1", "department_name":"ต้มไก่", "account_id": "3"}');
        INSERT INTO work_on VALUES(4, 1, '08:01', NULL, NULL, cast(now() - INTERVAL '-1 days' as date));
        INSERT INTO logs(mng_id, action, details) VALUES ('1', 'ADD', '{"department_id":"1", "department_name":"ต้มไก่", "account_id": "4"}');
        INSERT INTO work_on VALUES(5, 1, NULL, NULL, NULL, cast(now() - INTERVAL '-1 days' as date));
        INSERT INTO logs(mng_id, action, details) VALUES ('1', 'ADD', '{"department_id":"1", "department_name":"ต้มไก่", "account_id": "5"}');

        INSERT INTO work_on VALUES(6, 2, '07:45', NULL, NULL, cast(now() as date));
        INSERT INTO logs(mng_id, action, details) VALUES ('1', 'ADD', '{"department_id":"2", "department_name":"ต้มไก่", "account_id": "6"}');
        INSERT INTO work_on VALUES(7, 2, '08:00', NULL, NULL, cast(now() as date));
        INSERT INTO logs(mng_id, action, details) VALUES ('1', 'ADD', '{"department_id":"2", "department_name":"ต้มไก่", "account_id": "7"}');
        INSERT INTO work_on VALUES(8, 2, '08:01', NULL, NULL, cast(now() - INTERVAL '-1 days' as date));
        INSERT INTO logs(mng_id, action, details) VALUES ('1', 'ADD', '{"department_id":"2", "department_name":"ต้มไก่", "account_id": "7"}');

        INSERT INTO requests values(1, 3, cast(now() as date), 4, 'รอดำเนินการ', '1');
        INSERT INTO logs(mng_id, action, details) VALUES ('1', 'ADD_OT', '{"department_id":"1", "department_name":"ต้มไก่", "account_id": "3"}');
        INSERT INTO requests values(1, 4, cast(now() as date), 4, 'รอดำเนินการ', '1');
        INSERT INTO logs(mng_id, action, details) VALUES ('1', 'ADD_OT', '{"department_id":"1", "department_name":"ต้มไก่", "account_id": "4"}');
        INSERT INTO requests values(1, 5, cast(now() - INTERVAL '-1 days' as date), 4, 'รอดำเนินการ', '1');
        INSERT INTO logs(mng_id, action, details) VALUES ('1', 'ADD_OT', '{"department_id":"1", "department_name":"ต้มไก่", "account_id": "5"}');

        INSERT INTO requests values(2, 6, cast(now() as date), 4, 'รอดำเนินการ', '1');
        INSERT INTO requests values(2, 7, cast(now() as date), 4, 'รอดำเนินการ', '1');
        INSERT INTO requests values(2, 8, cast(now() - INTERVAL '-1 days' as date), 4, 'รอดำเนินการ', '1');
end$$;
