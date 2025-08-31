// src/controller/clients.js

const db = require('../config/dbConfig');
const { v4: uuidv4 } = require('uuid');

/**
 * Cria um novo cliente.
 */
const createClient = async (req, res, next) => {
    const { establishment_id, full_name, phone, email, birth_date, address } = req.body;
    const newId = uuidv4();

    try {
        const query = `
            INSERT INTO clients (id, establishment_id, full_name, phone, email, birth_date, address)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *;
        `;
        const values = [newId, establishment_id, full_name, phone, email, birth_date, address];
        const result = await db.query(query, values);
        res.status(201).json(result.rows[0]);
    } catch (error) {
        // Trata erro de e-mail duplicado
        if (error.code === '23505' && error.constraint === 'clients_email_key') {
            return res.status(409).json({ message: 'O e-mail informado já está em uso.' });
        }
        next(error);
    }
};

/**
 * Lista todos os clientes de um estabelecimento.
 */
const listClients = async (req, res, next) => {
    const { establishment_id } = req.query;
    if (!establishment_id) {
        return res.status(400).json({ message: 'O ID do estabelecimento (establishment_id) é obrigatório.' });
    }

    try {
        const query = 'SELECT * FROM clients WHERE establishment_id = $1 ORDER BY full_name ASC';
        const result = await db.query(query, [establishment_id]);
        res.status(200).json(result.rows);
    } catch (error) {
        next(error);
    }
};

/**
 * Obtém um cliente específico pelo seu ID.
 */
const getClientById = async (req, res, next) => {
    const { id } = req.params;
    try {
        const result = await db.query('SELECT * FROM clients WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Cliente não encontrado.' });
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {
        next(error);
    }
};

/**
 * Atualiza os dados de um cliente.
 */
const updateClient = async (req, res, next) => {
    const { id } = req.params;
    const { full_name, phone, email, birth_date, address } = req.body;
    try {
        const query = `
            UPDATE clients
            SET full_name = $1, phone = $2, email = $3, birth_date = $4, address = $5, updated_at = NOW()
            WHERE id = $6
            RETURNING *;
        `;
        const values = [full_name, phone, email, birth_date, address, id];
        const result = await db.query(query, values);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Cliente não encontrado.' });
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {
        if (error.code === '23505' && error.constraint === 'clients_email_key') {
            return res.status(409).json({ message: 'O e-mail informado já está em uso por outro cliente.' });
        }
        next(error);
    }
};

/**
 * Deleta um cliente.
 */
const deleteClient = async (req, res, next) => {
    const { id } = req.params;
    try {
        const result = await db.query('DELETE FROM clients WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Cliente não encontrado.' });
        }
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createClient,
    listClients,
    getClientById,
    updateClient,
    deleteClient,
};