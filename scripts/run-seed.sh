#!/bin/bash
source ../.development.env

cat "$SCRIPTS_DIR/../sql/schema.sql"\
    | psql  postgresql://$POSTGRES_USER:$POSTGRES_PASSWORD@$POSTGRES_HOST:$POSTGRES_PORT/$POSTGRES_DB

node ../seed.js