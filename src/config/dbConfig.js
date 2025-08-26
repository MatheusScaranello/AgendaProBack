// dbConfig.js
require('dotenv').config(); // Carrega as variáveis de ambiente do arquivo .env
const { Pool } = require('pg');

// Configuração do pool de conexões.
// A biblioteca 'pg' usará automaticamente a variável DATABASE_URL do seu ambiente.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

// Exporta o pool para ser utilizado em outras partes da sua aplicação
module.exports = pool;