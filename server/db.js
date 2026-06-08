const { Pool } = require('pg');
require('dotenv').config();

// Configuration for PostgreSQL connection [cite: 33, 192]
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

module.exports = pool;