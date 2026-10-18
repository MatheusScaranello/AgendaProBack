
require('dotenv').config();

const db = require('./src/config/dbConfig');

async function verificarBanco() {
  try {
    const resultado = await db.query(`
      SELECT
        current_database() AS banco,
        current_schema() AS schema,
        current_user AS usuario
    `);

    console.table(resultado.rows);
  } catch (erro) {
    console.error('Erro:', erro.message);
  } finally {
    process.exit();
  }
}

verificarBanco();
