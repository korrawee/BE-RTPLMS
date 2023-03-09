#!/bin/bash
# Create your own .development.env file 
# Use .production.env file, if you need to sync with prod. DB
source ../.test.env


cat "$SCRIPTS_DIR/../sql/schema.sql" "$SCRIPTS_DIR/../sql/dev-seeds.sql" \
    | psql  postgresql://$POSTGRES_USER:$POSTGRES_PASSWORD@$POSTGRES_HOST:$POSTGRES_PORT/test
