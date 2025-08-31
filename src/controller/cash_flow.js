// src/controller/cash_flow.js

const db = require('../config/dbConfig');
const { v4: uuidv4 } = require('uuid');

/**
 * Cria uma nova entrada no fluxo de caixa (entrada ou saída).
 */
const createCashFlowEntry = async (req, res, next) => {
    const { establishment_id, type, description, amount } = req.body;
    const newId = uuidv4();

    // Validação simples para o tipo de transação
    if (type !== 'Entrada' && type !== 'Saída') {
        return res.status(400).json({ message: "O campo 'type' deve ser 'Entrada' ou 'Saída'." });
    }

    try {
        const query = `
            INSERT INTO cash_flow (id, establishment_id, type, description, amount)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *;
        `;
        const values = [newId, establishment_id, type, description, amount];
        const result = await db.query(query, values);
        res.status(201).json(result.rows[0]);
    } catch (error) {
        next(error);
    }
};

/**
 * Lista as movimentações do fluxo de caixa, com filtros.
 * Ex: /cash_flow?establishment_id=uuid&startDate=2025-08-01&endDate=2025-08-31
 */
const listCashFlow = async (req, res, next) => {
    const { establishment_id, startDate, endDate } = req.query;
    
    if (!establishment_id) {
        return res.status(400).json({ message: 'O ID do estabelecimento (establishment_id) é obrigatório.' });
    }

    let query = 'SELECT * FROM cash_flow WHERE establishment_id = $1';
    const values = [establishment_id];
    let counter = 2;

    if (startDate && endDate) {
        query += ` AND transaction_date BETWEEN $${counter++} AND $${counter++}`;
        values.push(startDate, endDate);
    } else if (startDate) {
        query += ` AND transaction_date >= $${counter++}`;
        values.push(startDate);
    }

    query += ' ORDER BY transaction_date DESC';

    try {
        const result = await db.query(query, values);
        res.status(200).json(result.rows);
    } catch (error) {
        next(error);
    }
};

/**
 * Deleta uma entrada do fluxo de caixa.
 */
const deleteCashFlowEntry = async (req, res, next) => {
    const { id } = req.params;
    try {
        const result = await db.query('DELETE FROM cash_flow WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Lançamento não encontrado.' });
        }
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};


module.exports = {
    createCashFlowEntry,
    listCashFlow,
    deleteCashFlowEntry,
};