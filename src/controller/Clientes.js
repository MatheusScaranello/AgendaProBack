// CREATE TABLE Clientes (
//     id SERIAL PRIMARY KEY,
//     nome VARCHAR(255) NOT NULL,
//     telefone VARCHAR(20),
//     email VARCHAR(255),
//     valor_gasto NUMERIC(10,2) DEFAULT 0,
//     observacoes TEXT,
//     frequencia INT DEFAULT 0,
//     valor_perdido NUMERIC(10,2) DEFAULT 0,
//     estabelecimento_id INT REFERENCES Estabelecimento(id) ON DELETE CASCADE
// );

// Importa o pool de conexões com o banco de dados
const pool = require("../config/dbConfig");

// Função assíncrona para obter todos os clientes
async function getClientes(req, res) {
    try {
        const result = await pool.query("SELECT * FROM clientes");
        res.status(200).json(result.rows);
    } catch (error) {
        console.error("Erro ao obter clientes:", error);
        res.status(500).json({ error: "Erro ao obter clientes" });
    }
}

async function getClienteById(req, res) {
    const { id } = req.params;

    try {
        const result = await pool.query("SELECT * FROM clientes WHERE id = $1", [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Cliente não encontrado" });
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error("Erro ao obter cliente:", error);
        res.status(500).json({ error: "Erro ao obter cliente" });
    }
}

// Função para criar cliente
async function createCliente(req, res) {
    const { nome, telefone, email, valor_gasto, observacoes, frequencia, valor_perdido, estabelecimento_id } = req.body;

    try {
        const result = await pool.query(
            "INSERT INTO clientes (nome, telefone, email, valor_gasto, observacoes, frequencia, valor_perdido, estabelecimento_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *",
            [nome, telefone, email, valor_gasto, observacoes, frequencia, valor_perdido, estabelecimento_id]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error("Erro ao criar cliente:", error);
        res.status(500).json({ error: "Erro ao criar cliente" });
    }
}

async function updateCliente(req, res) {
    const { id } = req.params;
    const { nome, telefone, email, valor_gasto, observacoes, frequencia, valor_perdido, estabelecimento_id } = req.body;

    try {
        const result = await pool.query(
            "UPDATE clientes SET nome = $1, telefone = $2, email = $3, valor_gasto = $4, observacoes = $5, frequencia = $6, valor_perdido = $7, estabelecimento_id = $8 WHERE id = $9 RETURNING *",
            [nome, telefone, email, valor_gasto, observacoes, frequencia, valor_perdido, estabelecimento_id, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Cliente não encontrado" });
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error("Erro ao atualizar cliente:", error);
        res.status(500).json({ error: "Erro ao atualizar cliente" });
    }
}

async function deleteCliente(req, res) {
    const { id } = req.params;

    try {
        const result = await pool.query(
            "DELETE FROM clientes WHERE id = $1 RETURNING *",
            [id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Cliente não encontrado" });
        }
        res.status(204).send();
    } catch (error) {
        console.error("Erro ao deletar cliente:", error);
        res.status(500).json({ error: "Erro ao deletar cliente" });
    }
}

module.exports = {
    getClientes,
    getClienteById,
    createCliente,
    updateCliente,
    deleteCliente
};