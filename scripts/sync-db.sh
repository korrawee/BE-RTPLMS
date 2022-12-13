#!/bin/bash

SCRIPTS_DIR=`dirname "$0"`
PGPASSWORD=1234

cat "$SCRIPTS_DIR/../sql/schema.sql" "$SCRIPTS_DIR/../sql/dev-seeds.sql" \
    | psql -U korrawee_ -d test_seed -p 5432 -h localhost -1 -f -