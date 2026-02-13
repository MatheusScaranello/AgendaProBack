const db = require('../config/dbConfig');
const { v4: uuidv4 } = require('uuid');

// Criar um novo cliente
const createClient = async (req, res, next) => {
    const { full_name, phone, email, birth_date } = req.body;
    const newId = uuidv4();
    try {
        const result = await db.query(
            'INSERT INTO clients (id, full_name, phone, email, birth_date) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [newId, full_name, phone, email, birth_date]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        next(err);
    }
};

// Listar todos os clientes
const listClients = async (req, res, next) => {
    try {
        const { rows } = await db.query('SELECT * FROM clients ORDER BY full_name ASC');
        res.json(rows);
    } catch (err) {
        next(err);
    }
};

// Obter um cliente pelo ID
const getClientById = async (req, res, next) => {
    const { id } = req.params;
    try {
        const { rows } = await db.query('SELECT * FROM clients WHERE id = $1', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Cliente não encontrado' });
        }
        res.json(rows[0]);
    } catch (err) {
        next(err);
    }
};

// Atualizar um cliente
const updateClient = async (req, res, next) => {
    const { id } = req.params;
    const { full_name, phone, email, birth_date } = req.body;
    try {
        const result = await db.query(
            'UPDATE clients SET full_name = $1, phone = $2, email = $3, birth_date = $4, updated_at = CURRENT_TIMESTAMP WHERE id = $5 RETURNING *',
            [full_name, phone, email, birth_date, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Cliente não encontrado' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        next(err);
    }
};

// Excluir um cliente
const deleteClient = async (req, res, next) => {
    const { id } = req.params;
    try {
        const result = await db.query('DELETE FROM clients WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Cliente não encontrado' });
        }
        res.status(204).send(); // Sucesso sem conteúdo
    } catch (err) {
        next(err);
    }
};

module.exports = {
    createClient,
    listClients,
    getClientById,
    updateClient,
    deleteClient,
};