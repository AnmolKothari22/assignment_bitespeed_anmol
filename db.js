const { Pool } = require('pg');

let pool;

if (process.env.DATABASE_URL) {
  // Production (Render)
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
} else {
  // Local
  pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'testdb',
    password: process.env.PASSWORD,
    port: process.env.DB_PORT,
  });
}

module.exports = pool;