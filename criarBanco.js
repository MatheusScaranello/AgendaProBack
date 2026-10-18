
require('dotenv').config();

const fs = require('fs');
const path = require('path');
const db = require('./src/config/dbConfig');

async function criarBanco() {
  try {
    const arquivoSQL = path.join(
      __dirname,
      'src',
      'bd',
      'agendapro.sql'
    );

    const sql = fs.readFileSync(arquivoSQL, 'utf8');

    await db.query(sql);

    console.log('Tabelas originais criadas com sucesso!');

    await db.query(`
      CREATE TABLE IF NOT EXISTS establishments (
        id BIGSERIAL PRIMARY KEY,
        name VARCHAR(150) NOT NULL,
        trade_name VARCHAR(150),
        email VARCHAR(255) NOT NULL UNIQUE,
        phone VARCHAR(30),
        plan VARCHAR(30) NOT NULL DEFAULT 'teste',
        password_hash TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    console.log('Tabela establishments criada com sucesso!');

    const resultado = await db.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);

    console.table(resultado.rows);

  } catch (erro) {
    console.error('Erro ao criar tabelas:', erro.message);
  } finally {
    process.exit();
  }
}

criarBanco();
