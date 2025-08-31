// src/controller/services.js

const db = require('../config/dbConfig');
const { v4: uuidv4 } = require('uuid');

/**
 * Cria um novo serviço.
 */
const createService = async (req, res, next) => {
    const { establishment_id, name, description, duration_minutes, price, is_active } = req.body;
    const newId = uuidv4();

    try {
        const query = `
            INSERT INTO services (id, establishment_id, name, description, duration_minutes, price, is_active)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *;
        `;
        const values = [newId, establishment_id, name, description, duration_minutes, price, is_active ?? true];
        const result = await db.query(query, values);
        res.status(201).json(result.rows[0]);
    } catch (error) {
        next(error);
    }
};

/**
 * Lista todos os serviços de um estabelecimento.
 */
const listServices = async (req, res, next) => {
    const { establishment_id } = req.query;
    if (!establishment_id) {
        return res.status(400).json({ message: 'O ID do estabelecimento (establishment_id) é obrigatório.' });
    }

    try {
        const query = 'SELECT * FROM services WHERE establishment_id = $1 ORDER BY name ASC';
        const result = await db.query(query, [establishment_id]);
        res.status(200).json(result.rows);
    } catch (error) {
        next(error);
    }
};

/**
 * Obtém um serviço específico pelo seu ID.
 */
const getServiceById = async (req, res, next) => {
    const { id } = req.params;
    try {
        const result = await db.query('SELECT * FROM services WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Serviço não encontrado.' });
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {
        next(error);
    }
};

/**
 * Atualiza os dados de um serviço.
 */
const updateService = async (req, res, next) => {
    const { id } = req.params;
    const { name, description, duration_minutes, price, is_active } = req.body;
    try {
        const query = `
            UPDATE services
            SET name = $1, description = $2, duration_minutes = $3, price = $4, is_active = $5, updated_at = NOW()
            WHERE id = $6
            RETURNING *;
        `;
        const values = [name, description, duration_minutes, price, is_active, id];
        const result = await db.query(query, values);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Serviço não encontrado.' });
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {
        next(error);
    }
};

/**
 * Deleta um serviço.
 */
const deleteService = async (req, res, next) => {
    const { id } = req.params;
    try {
        const result = await db.query('DELETE FROM services WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Serviço não encontrado.' });
        }
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createService,
    listServices,
    getServiceById,
    updateService,
    deleteService,
};