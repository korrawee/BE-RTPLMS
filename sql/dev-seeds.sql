do $$
declare
add integer := 0;

begin
while add <10 loop
    INSERT INTO accounts VALUES (add,'user','1234','full-name','worker','0981',12.0,'{"data": "eiei"}', NULL);
    add := add+1;
    INSERT INTO shifts VALUES (add, '2022-12-27', '08:00:00', 500, 100, 20, 30, 15);
end loop;

    INSERT INTO departments VALUES (1, 'ต้มไก่', 1);
    INSERT INTO departments VALUES (2, 'ต้มไก่', 1);
    INSERT INTO _controls VALUES (1, 1);
    INSERT INTO _controls VALUES (2, 2);

    INSERT INTO work_on VALUES(1, 2, 1, '08:00', NULL, NULL, '2022-12-27');
    INSERT INTO work_on VALUES(2, 3, 2, '08:00', NULL, NULL, '2022-12-27');
end$$;
