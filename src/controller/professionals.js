// src/controller/professionals.js

const db = require('../config/dbConfig');
const { v4: uuidv4 } = require('uuid');

// Criar um novo profissional
const createProfessional = async (req, res, next) => {
    const { full_name, phone, email } = req.body;
    const newId = uuidv4();
    try {
        const result = await db.query(
            'INSERT INTO professionals (id, full_name, phone, email) VALUES ($1, $2, $3, $4) RETURNING *',
            [newId, full_name, phone, email]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        next(err);
    }
};

// Listar todos os profissionais
const listProfessionals = async (req, res, next) => {
    try {
        const { rows } = await db.query('SELECT * FROM professionals ORDER BY full_name ASC');
        res.json(rows);
    } catch (err) {
        next(err);
    }
};

// Obter um profissional pelo ID
const getProfessionalById = async (req, res, next) => {
    const { id } = req.params;
    try {
        const { rows } = await db.query('SELECT * FROM professionals WHERE id = $1', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Profissional não encontrado' });
        }
        res.json(rows[0]);
    } catch (err) {
        next(err);
    }
};

// Atualizar um profissional
const updateProfessional = async (req, res, next) => {
    const { id } = req.params;
    const { full_name, phone, email } = req.body;
    try {
        const result = await db.query(
            'UPDATE professionals SET full_name = $1, phone = $2, email = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4 RETURNING *',
            [full_name, phone, email, id]
        );
        if (result.rows.length === 0) { 
            return res.status(404).json({ message: 'Profissional não encontrado' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        next(err);
    }
};

// Deletar um profissional
const deleteProfessional = async (req, res, next) => {
    const { id } = req.params;
    try {
        const result = await db.query('DELETE FROM professionals WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Profissional não encontrado' });
        }
        res.json({ message: 'Profissional deletado com sucesso' });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    createProfessional,
    listProfessionals,
    getProfessionalById,
    updateProfessional,
    deleteProfessional
};