do $$
declare
add integer := 0;
begin
while add <10 loop
    insert into accounts values (add,'user','1234','full-name','worker','0981',12.0,'{"data": "eiei"}', null);
add := add+1;
end loop;
end$$;