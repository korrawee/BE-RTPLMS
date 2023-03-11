const fs = require('fs');
const { Pool } = require('pg');
require('dotenv').config()

// Read the JSON file
const data = fs.readFileSync('../data_set/Managers.json');

// Parse the JSON data
const jsonData = JSON.parse(data);

console.log(jsonData)

// Set up the connection to the PostgreSQL database
const pool = new Pool({
  user: process.env.POSTGRES_USER,
  host: process.env.POSTGRES_HOST,
  database: process.env.POSTGRES_DB,
  password: process.env.POSTGRES_PASSWORD,
  port: process.env.POSTGRES_PORT, // or the port number of your PostgreSQL server
});