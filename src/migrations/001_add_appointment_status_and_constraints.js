// migrations/001_add_appointment_status_and_constraints.js
const db = require('../src/config/dbConfig');

/**
 * Script de migração para adicionar o sistema de status de agendamento.
 *
 * O que ele faz:
 * 1. Adiciona um novo tipo ENUM chamado `appointment_status` com os valores permitidos.
 * 2. Altera a coluna `status` da tabela `appointments` para usar este novo tipo.
 * 3. Define o valor padrão como 'scheduled'.
 * 4. Atualiza todos os registros existentes de 'Agendado' para 'scheduled'.
 */
async function up() {
    const client = await db.pool.connect();
    try {
        await client.query('BEGIN');

        console.log('Criando o tipo ENUM appointment_status...');
        await client.query(`
      CREATE TYPE appointment_status AS ENUM ('scheduled', 'completed', 'canceled');
    `);

        console.log('Alterando a coluna `status` para usar o novo tipo ENUM...');
        // Primeiro, removemos o default antigo
        await client.query(`ALTER TABLE appointments ALTER COLUMN status DROP DEFAULT;`);
        // Agora, alteramos o tipo da coluna usando o novo ENUM e definimos um novo padrão
        await client.query(`
      ALTER TABLE appointments
      ALTER COLUMN status TYPE appointment_status
      USING status::text::appointment_status;
    `);
        await client.query(`
      ALTER TABLE appointments
      ALTER COLUMN status SET DEFAULT 'scheduled';
    `);

        console.log("Atualizando registros existentes de 'Agendado' para 'scheduled'...");
        const result = await client.query(
            "UPDATE appointments SET status = 'scheduled' WHERE status = 'Agendado'::text::appointment_status;"
        );
        console.log(`${result.rowCount} registros atualizados.`);

        await client.query('COMMIT');
        console.log('Migração "up" concluída com sucesso!');
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Erro durante a migração "up":', err);
        throw err;
    } finally {
        client.release();
    }
}

/**
 * Script para reverter a migração (rollback).
 *
 * O que ele faz:
 * 1. Altera a coluna `status` de volta para VARCHAR(50).
 * 2. Remove o tipo ENUM `appointment_status`.
 * 3. Atualiza os status de 'scheduled' de volta para 'Agendado'.
 */
async function down() {
    const client = await db.pool.connect();
    try {
        await client.query('BEGIN');

        console.log("Revertendo status de 'scheduled' para 'Agendado'...");
        await client.query(
            "UPDATE appointments SET status = 'Agendado' WHERE status = 'scheduled';"
        );

        console.log('Alterando a coluna `status` de volta para VARCHAR(50)...');
        await client.query(`ALTER TABLE appointments ALTER COLUMN status TYPE VARCHAR(50);`);
        await client.query(
            `ALTER TABLE appointments ALTER COLUMN status SET DEFAULT 'Agendado';`
        );

        console.log('Removendo o tipo ENUM appointment_status...');
        await client.query(`DROP TYPE appointment_status;`);

        await client.query('COMMIT');
        console.log('Migração "down" (rollback) concluída com sucesso!');
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Erro durante a migração "down":', err);
        throw err;
    } finally {
        client.release();
    }
}

// Lógica para rodar via linha de comando: node migrations/001_... up|down
const command = process.argv[2];
if (command === 'up') {
    up().catch((err) => process.exit(1));
} else if (command === 'down') {
    down().catch((err) => process.exit(1));
}
