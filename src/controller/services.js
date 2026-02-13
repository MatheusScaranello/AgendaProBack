// src/controller/services.js

const db = require('../config/dbConfig');
const { v4: uuidv4 } = require('uuid');

// Criar um novo serviço
const createService = async (req, res, next) => {
    const { professional_id, name, description, duration_minutes, price } = req.body;
    const newId = uuidv4();
    try {
        const result = await db.query(
            'INSERT INTO services (id, professional_id, name, description, duration_minutes, price) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [newId, professional_id, name, description, duration_minutes, price]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        next(err);
    }
};

// Listar todos os serviços
const listServices = async (req, res, next) => {
    try {
        const { rows } = await db.query('SELECT * FROM services ORDER BY name ASC');
        res.json(rows);
    } catch (err) {
        next(err);
    }
};

// Listar serviços por profissional
const listServicesByProfessional = async (req, res, next) => {
    const { professional_id } = req.params;
    try {
        const query = 'SELECT * FROM services WHERE professional_id = $1 ORDER BY name ASC';
        const result = await db.query(query, [professional_id]);
        res.status(200).json(result.rows);
    } catch (error) {
        next(error);
    }
};

// Obter um serviço pelo ID
const getServiceById = async (req, res, next) => {
    const { id } = req.params;
    try {
        const { rows } = await db.query('SELECT * FROM services WHERE id = $1', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Serviço não encontrado' });
        }
        res.json(rows[0]);
    } catch (err) {
        next(err);
    }
};

// Atualizar um serviço
const updateService = async (req, res, next) => {
    const { id } = req.params;
    const { name, description, duration_minutes, price, is_active } = req.body;
    try {
        const result = await db.query(
            'UPDATE services SET name = $1, description = $2, duration_minutes = $3, price = $4, is_active = $5, updated_at = CURRENT_TIMESTAMP WHERE id = $6 RETURNING *',
            [name, description, duration_minutes, price, is_active, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Serviço não encontrado' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        next(err);
    }
};

// Deletar um serviço
const deleteService = async (req, res, next) => {
    const { id } = req.params;
    try {
        const result = await db.query('DELETE FROM services WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Serviço não encontrado' });
        }
        res.json({ message: 'Serviço deletado com sucesso' });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    createService,
    listServices,
    getServiceById,
    updateService,
    deleteService
};