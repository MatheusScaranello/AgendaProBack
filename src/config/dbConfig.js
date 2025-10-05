// src/config/dbConfig.js

const { Pool } = require('@neondatabase/serverless');
require('dotenv').config();

// Validação para garantir que a variável de ambiente está definida
if (!process.env.DATABASE_URL) {
  throw new Error("A variável de ambiente 'DATABASE_URL' não foi definida.");
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};