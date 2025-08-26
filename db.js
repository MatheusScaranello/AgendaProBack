// db.js
import pg from "pg";
import dotenv from "dotenv";
dotenv.config();

const { Pool } = pg;

/*
 Use DATABASE_URL (pooling) por padrão.
 Para operações que precisam de conexão sem pgbouncer (ex: algumas migrações),
 use DATABASE_URL_UNPOOLED enquanto executar a única operação.
*/

const connectionString = process.env.DATABASE_URL ||
                         (process.env.PGHOST ? `postgresql://${process.env.PGUSER}:${process.env.PGPASSWORD}@${process.env.PGHOST}:${process.env.PGPORT || 5432}/${process.env.PGDATABASE}` : null);

if (!connectionString) {
  console.error("Nenhuma string de conexão encontrada. Defina DATABASE_URL ou PGHOST/PGUSER/PGPASSWORD/PGDATABASE em .env");
  process.exit(1);
}

export const pool = new Pool({
  connectionString,
  // Recomendado para Neon: habilitar ssl, ignorando verificação do certificado caso necessário
  ssl: {
    rejectUnauthorized: false
  },
  // Ajustes razoáveis de pool para apps Node/Express
  max: process.env.PG_MAX_CLIENTS ? Number(process.env.PG_MAX_CLIENTS) : 6,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000
});

pool.on("error", (err) => {
  console.error("Erro no pool do PostgreSQL:", err);
});

