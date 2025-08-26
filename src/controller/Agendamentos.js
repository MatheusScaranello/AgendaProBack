// CREATE TABLE Agendamentos (
//     id SERIAL PRIMARY KEY,
//     cliente_id INT REFERENCES Clientes(id) ON DELETE CASCADE,
//     profissional_id INT REFERENCES Profissionais(id) ON DELETE CASCADE,
//     data_hora TIMESTAMP NOT NULL,
//     status VARCHAR(50) DEFAULT 'pendente'
// );

// Importa o pool de conexões com o banco de dados
const pool = require("../config/dbConfig");

// Função assíncrona para obter todos os agendamentos
async function getAgendamentos(req, res) {
    try {
        const result = await pool.query("SELECT * FROM agendamentos");
        res.status(200).json(result.rows);
    } catch (error) {
        console.error("Erro ao obter agendamentos:", error);
        res.status(500).json({ error: "Erro ao obter agendamentos" });
    }
}

async function createAgendamento(req, res) {
    const { cliente_id, profissional_id, data_hora, status } = req.body;

    try {
        const result = await pool.query(
            "INSERT INTO agendamentos (cliente_id, profissional_id, data_hora, status) VALUES ($1, $2, $3, $4) RETURNING *",
            [cliente_id, profissional_id, data_hora, status]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error("Erro ao criar agendamento:", error);
        res.status(500).json({ error: "Erro ao criar agendamento" });
    }
}

async function updateAgendamento(req, res) {
    const { id } = req.params;
    const { cliente_id, profissional_id, data_hora, status } = req.body;

    try {
        const result = await pool.query(
            "UPDATE agendamentos SET cliente_id = $1, profissional_id = $2, data_hora = $3, status = $4 WHERE id = $5 RETURNING *",
            [cliente_id, profissional_id, data_hora, status, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Agendamento não encontrado" });
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error("Erro ao atualizar agendamento:", error);
        res.status(500).json({ error: "Erro ao atualizar agendamento" });
    }
}

async function deleteAgendamento(req, res) {
    const { id } = req.params;

    try {
        const result = await pool.query(
            "DELETE FROM agendamentos WHERE id = $1 RETURNING *",
            [id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Agendamento não encontrado" });
        }
        res.status(204).send();
    } catch (error) {
        console.error("Erro ao deletar agendamento:", error);
        res.status(500).json({ error: "Erro ao deletar agendamento" });
    }
}

module.exports = {
    getAgendamentos,
    createAgendamento,
    updateAgendamento,
    deleteAgendamento
};
