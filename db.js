const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'testdb',
  password: process.env.PASSWORD,
  port: process.env.PORT,
});

module.exports = pool;


