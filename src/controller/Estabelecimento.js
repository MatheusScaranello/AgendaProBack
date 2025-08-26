// CREATE TABLE Estabelecimento (
//     id SERIAL PRIMARY KEY,
//     nome VARCHAR(255) NOT NULL,
//     email VARCHAR(255) UNIQUE NOT NULL,
//     telefone VARCHAR(20),
//     plano VARCHAR(100),
//     ultima_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//     senha TEXT NOT NULL
// );



// Importa o pool de conexões com o banco de dados
const pool = require("../config/dbConfig");

// Função assíncrona para obter todos os estabelecimentos
async function getEstabelecimentos(req, res) {
    try {
        const result = await pool.query("SELECT * FROM estabelecimentos");
        res.status(200).json(result.rows);
    } catch (error) {
        console.error("Erro ao obter estabelecimentos:", error);
        res.status(500).json({ error: "Erro ao obter estabelecimentos" });
    }
}

async function createEstabelecimento(req, res) {
    const { nome, email, telefone, plano, senha } = req.body;

    try {
        const result = await pool.query(
            "INSERT INTO estabelecimentos (nome, email, telefone, plano, senha) VALUES ($1, $2, $3, $4, $5) RETURNING *",
            [nome, email, telefone, plano, senha]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error("Erro ao criar estabelecimento:", error);
        res.status(500).json({ error: "Erro ao criar estabelecimento" });
    }
}

async function updateEstabelecimento(req, res) {
    const { id } = req.params;
    const { nome, email, telefone, plano, senha } = req.body;

    try {
        const result = await pool.query(
            "UPDATE estabelecimentos SET nome = $1, email = $2, telefone = $3, plano = $4, senha = $5, ultima_atualizacao = CURRENT_TIMESTAMP WHERE id = $6 RETURNING *",
            [nome, email, telefone, plano, senha, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Estabelecimento não encontrado" });
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error("Erro ao atualizar estabelecimento:", error);
        res.status(500).json({ error: "Erro ao atualizar estabelecimento" });
    }
}

async function deleteEstabelecimento(req, res) {
    const { id } = req.params;

    try {
        const result = await pool.query(
            "DELETE FROM estabelecimentos WHERE id = $1 RETURNING *",
            [id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Estabelecimento não encontrado" });
        }
        res.status(204).send();
    } catch (error) {
        console.error("Erro ao deletar estabelecimento:", error);
        res.status(500).json({ error: "Erro ao deletar estabelecimento" });
    }
}

async function createEstabelecimento(req, res) {
    const { nome, email, telefone, plano, senha } = req.body;

    try {
        const result = await pool.query(
            "INSERT INTO estabelecimentos (nome, email, telefone, plano, senha) VALUES ($1, $2, $3, $4, $5) RETURNING *",
            [nome, email, telefone, plano, senha]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error("Erro ao criar estabelecimento:", error);
        res.status(500).json({ error: "Erro ao criar estabelecimento" });
    }
}

async function updateEstabelecimento(req, res) {
    const { id } = req.params;
    const { nome, email, telefone, plano, senha } = req.body;

    try {
        const result = await pool.query(
            "UPDATE estabelecimentos SET nome = $1, email = $2, telefone = $3, plano = $4, senha = $5, ultima_atualizacao = CURRENT_TIMESTAMP WHERE id = $6 RETURNING *",
            [nome, email, telefone, plano, senha, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Estabelecimento não encontrado" });
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error("Erro ao atualizar estabelecimento:", error);
        res.status(500).json({ error: "Erro ao atualizar estabelecimento" });
    }
}

async function deleteEstabelecimento(req, res) {
    const { id } = req.params;

    try {
        const result = await pool.query(
            "DELETE FROM estabelecimentos WHERE id = $1 RETURNING *",
            [id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Estabelecimento não encontrado" });
        }
        res.status(204).send();
    } catch (error) {
        console.error("Erro ao deletar estabelecimento:", error);
        res.status(500).json({ error: "Erro ao deletar estabelecimento" });
    }
}

    // Função para listar todos os estabelecimentos
    async function listEstabelecimentos(req, res) {
        try {
            const result = await pool.query("SELECT * FROM estabelecimentos");
            res.status(200).json(result.rows);
        } catch (error) {
            console.error("Erro ao listar estabelecimentos:", error);
            res.status(500).json({ error: "Erro ao listar estabelecimentos" });
        }
    }

    // Função para obter um estabelecimento pelo ID
    async function getEstabelecimentoById(req, res) {
        const { id } = req.params;

        try {
            const result = await pool.query("SELECT * FROM estabelecimentos WHERE id = $1", [id]);
            if (result.rows.length === 0) {
                return res.status(404).json({ error: "Estabelecimento não encontrado" });
            }
            res.status(200).json(result.rows[0]);
        } catch (error) {
            console.error("Erro ao obter estabelecimento:", error);
            res.status(500).json({ error: "Erro ao obter estabelecimento" });
        }
    }

    // Exporta as funções para uso em outros módulos
module.exports = {
    getEstabelecimentos,
    getEstabelecimentoById,
    createEstabelecimento,
    updateEstabelecimento,
    deleteEstabelecimento
};