#!/bin/bash
# Create your own .env files
source .env


cat "$SCRIPTS_DIR/../sql/schema.sql" "$SCRIPTS_DIR/../sql/dev-seeds.sql" \
    | psql -U $POSTGRES_USER -d $POSTGRES_DB -p $POSTGRES_PORT -h $POSTGRES_HOST -1 -f -