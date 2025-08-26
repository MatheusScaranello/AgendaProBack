// CREATE TABLE Profissionais (
//     id SERIAL PRIMARY KEY,
//     nome VARCHAR(255) NOT NULL,
//     valor_recebido NUMERIC(10,2) DEFAULT 0,
//     estabelecimento_id INT REFERENCES Estabelecimento(id) ON DELETE CASCADE
// );

// Importa o pool de conexões com o banco de dados
const pool = require("../config/dbConfig");

// Função assíncrona para obter todos os profissionais
async function getProfissionais(req, res) {
    try {
        const result = await pool.query("SELECT * FROM profissionais");
        res.status(200).json(result.rows);
    } catch (error) {
        console.error("Erro ao obter profissionais:", error);
        res.status(500).json({ error: "Erro ao obter profissionais" });
    }
}

async function getProfissionalById(req, res) {
    const { id } = req.params;

    try {
        const result = await pool.query("SELECT * FROM profissionais WHERE id = $1", [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Profissional não encontrado" });
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error("Erro ao obter profissional:", error);
        res.status(500).json({ error: "Erro ao obter profissional" });
    }
}


async function createProfissional(req, res) {
    const { nome, valor_recebido, estabelecimento_id } = req.body;

    try {
        const result = await pool.query(
            "INSERT INTO profissionais (nome, valor_recebido, estabelecimento_id) VALUES ($1, $2, $3) RETURNING *",
            [nome, valor_recebido, estabelecimento_id]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error("Erro ao criar profissional:", error);
        res.status(500).json({ error: "Erro ao criar profissional" });
    }
}

async function updateProfissional(req, res) {
    const { id } = req.params;
    const { nome, valor_recebido, estabelecimento_id } = req.body;

    try {
        const result = await pool.query(
            "UPDATE profissionais SET nome = $1, valor_recebido = $2, estabelecimento_id = $3 WHERE id = $4 RETURNING *",
            [nome, valor_recebido, estabelecimento_id, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Profissional não encontrado" });
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error("Erro ao atualizar profissional:", error);
        res.status(500).json({ error: "Erro ao atualizar profissional" });
    }
}

async function deleteProfissional(req, res) {
    const { id } = req.params;

    try {
        const result = await pool.query(
            "DELETE FROM profissionais WHERE id = $1 RETURNING *",
            [id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Profissional não encontrado" });
        }
        res.status(204).send();
    } catch (error) {
        console.error("Erro ao deletar profissional:", error);
        res.status(500).json({ error: "Erro ao deletar profissional" });
    }
}

// Exporta as funções para uso em outros módulos
module.exports = {
    getProfissionais,
    getProfissionalById,
    createProfissional,
    updateProfissional,
    deleteProfissional
};