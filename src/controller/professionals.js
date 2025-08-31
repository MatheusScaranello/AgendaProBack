// src/controller/professionals.js

const db = require('../config/dbConfig');
const { v4: uuidv4 } = require('uuid');

/**
 * Cria um novo profissional.
 */
const createProfessional = async (req, res, next) => {
    const { establishment_id, full_name, phone, email, professional_role, is_active } = req.body;
    const newId = uuidv4();

    try {
        const query = `
            INSERT INTO professionals (id, establishment_id, full_name, phone, email, professional_role, is_active)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *;
        `;
        const values = [newId, establishment_id, full_name, phone, email, professional_role, is_active ?? true];
        const result = await db.query(query, values);
        res.status(201).json(result.rows[0]);
    } catch (error) {
        if (error.code === '23505' && error.constraint === 'professionals_email_key') {
            return res.status(409).json({ message: 'O e-mail informado já está em uso.' });
        }
        next(error);
    }
};

/**
 * Lista todos os profissionais de um estabelecimento.
 */
const listProfessionals = async (req, res, next) => {
    const { establishment_id } = req.query;
    if (!establishment_id) {
        return res.status(400).json({ message: 'O ID do estabelecimento (establishment_id) é obrigatório.' });
    }

    try {
        const query = 'SELECT * FROM professionals WHERE establishment_id = $1 ORDER BY full_name ASC';
        const result = await db.query(query, [establishment_id]);
        res.status(200).json(result.rows);
    } catch (error) {
        next(error);
    }
};

/**
 * Obtém um profissional específico pelo seu ID.
 */
const getProfessionalById = async (req, res, next) => {
    const { id } = req.params;
    try {
        const result = await db.query('SELECT * FROM professionals WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Profissional não encontrado.' });
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {
        next(error);
    }
};

/**
 * Atualiza os dados de um profissional.
 */
const updateProfessional = async (req, res, next) => {
    const { id } = req.params;
    const { full_name, phone, email, professional_role, is_active } = req.body;
    try {
        const query = `
            UPDATE professionals
            SET full_name = $1, phone = $2, email = $3, professional_role = $4, is_active = $5, updated_at = NOW()
            WHERE id = $6
            RETURNING *;
        `;
        const values = [full_name, phone, email, professional_role, is_active, id];
        const result = await db.query(query, values);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Profissional não encontrado.' });
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {
        if (error.code === '23505' && error.constraint === 'professionals_email_key') {
            return res.status(409).json({ message: 'O e-mail informado já está em uso por outro profissional.' });
        }
        next(error);
    }
};

/**
 * Deleta um profissional.
 */
const deleteProfessional = async (req, res, next) => {
    const { id } = req.params;
    try {
        const result = await db.query('DELETE FROM professionals WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Profissional não encontrado.' });
        }
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};

// --- Lógica de Associação com Serviços ---

const associateService = async (req, res, next) => {
    const { professional_id } = req.params;
    const { service_id } = req.body;

    try {
        const query = 'INSERT INTO professional_services (professional_id, service_id) VALUES ($1, $2) RETURNING *';
        const result = await db.query(query, [professional_id, service_id]);
        res.status(201).json({ message: 'Serviço associado com sucesso!', association: result.rows[0] });
    } catch (error) {
        if (error.code === '23505') { 
            return res.status(409).json({ message: 'Este profissional já está associado a este serviço.' });
        }
        if (error.code === '23503') {
            return res.status(404).json({ message: 'Profissional ou Serviço não encontrado.' });
        }
        next(error);
    }
};

const listServicesByProfessional = async (req, res, next) => {
    const { professional_id } = req.params;
    try {
        const query = `
            SELECT s.* FROM services s
            JOIN professional_services ps ON s.id = ps.service_id
            WHERE ps.professional_id = $1;
        `;
        const result = await db.query(query, [professional_id]);
        res.status(200).json(result.rows);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createProfessional,
    listProfessionals,
    getProfessionalById,
    updateProfessional,
    deleteProfessional,
    associateService,
    listServicesByProfessional,
};