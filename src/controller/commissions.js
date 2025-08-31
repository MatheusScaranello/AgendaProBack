// src/controller/commissions.js

const db = require('../config/dbConfig');
const { v4: uuidv4 } = require('uuid');

/**
 * Cria (registra) uma nova comissão para um profissional sobre um item de venda.
 */
const createCommission = async (req, res, next) => {
    const { sale_item_id, professional_id, commission_percentage, commission_value } = req.body;
    const newId = uuidv4();

    try {
        const query = `
            INSERT INTO commissions (id, sale_item_id, professional_id, commission_percentage, commission_value)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *;
        `;
        const values = [newId, sale_item_id, professional_id, commission_percentage, commission_value];
        const result = await db.query(query, values);
        res.status(201).json(result.rows[0]);
    } catch (error) {
        // Erro comum: o sale_item_id ou professional_id não existe.
        if (error.code === '23503') {
            return res.status(404).json({ message: 'O item de venda ou profissional especificado não existe.' });
        }
        next(error);
    }
};

/**
 * Lista as comissões, com filtros por profissional ou por venda.
 * Ex: /commissions?professional_id=uuid
 * Ex: /commissions?sale_id=uuid
 */
const listCommissions = async (req, res, next) => {
    const { professional_id, sale_id } = req.query;
    
    let query = `
        SELECT c.*, s.name as service_name, p.full_name as professional_name 
        FROM commissions c
        JOIN professionals p ON c.professional_id = p.id
        JOIN sale_items si ON c.sale_item_id = si.id
        LEFT JOIN services s ON si.service_id = s.id
    `;
    const values = [];
    const conditions = [];
    let counter = 1;

    if (professional_id) {
        conditions.push(`c.professional_id = $${counter++}`);
        values.push(professional_id);
    }
    
    if (sale_id) {
        conditions.push(`si.sale_id = $${counter++}`);
        values.push(sale_id);
    }

    if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ' ORDER BY c.created_at DESC';

    try {
        const result = await db.query(query, values);
        res.status(200).json(result.rows);
    } catch (error) {
        next(error);
    }
};

/**
 * Obtém uma comissão específica pelo seu ID.
 */
const getCommissionById = async (req, res, next) => {
    const { id } = req.params;
    try {
        const result = await db.query('SELECT * FROM commissions WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Comissão não encontrada.' });
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {
        next(error);
    }
};


module.exports = {
    createCommission,
    listCommissions,
    getCommissionById,
};