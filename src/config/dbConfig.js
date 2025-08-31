// src/config/dbConfig.js

const { Pool } = require('pg');
require('dotenv').config();

// O cliente 'pg' vai ler a variável de ambiente DATABASE_URL automaticamente
// e entender todas as informações de conexão a partir dela.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};