#!/bin/bash

docker run --rm \
    --name test_seed \
    -e POSTGRES_PASSWORD=1234 \
    -e POSTGRES_USER=postgres \
    -e POSTGRES_DB=test_seed \
    -p 5432:5432 \
    -v somedb-vol:/var/lib/postgresql/data \
    postgres