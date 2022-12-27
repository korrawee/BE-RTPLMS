#!/bin/bash

SCRIPTS_DIR=`dirname "$0"`
PGPASSWORD=1234

cat "$SCRIPTS_DIR/../sql/schema.sql" "$SCRIPTS_DIR/../sql/dev-seeds.sql" \
    | psql  postgresql://postgres:12345678@database-2.cppxynlthmto.ap-northeast-1.rds.amazonaws.com:5432/test_seed
