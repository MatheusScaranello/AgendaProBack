// src/controller/sales.js

const db = require('../config/dbConfig');
const { v4: uuidv4 } = require('uuid');

// Criar uma nova venda
const createSale = async (req, res, next) => {
    const { appointment_id, client_id, professional_id, service_id, amount, payment_method } = req.body;
    const newId = uuidv4();
    try {
        const result = await db.query(
            'INSERT INTO sales (id, appointment_id, client_id, professional_id, service_id, amount, payment_method) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            [newId, appointment_id, client_id, professional_id, service_id, amount, payment_method]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        next(err);
    }
};

// Listar todas as vendas
const listSales = async (req, res, next) => {
    try {
        const { rows } = await db.query('SELECT * FROM sales ORDER BY transaction_date DESC');
        res.json(rows);
    } catch (err) {
        next(err);
    }

};

// Listar por profissional
const listSalesByProfessional = async (req, res, next) => {
    const { professional_id } = req.params;
    try {
        const query = 'SELECT * FROM sales WHERE professional_id = $1 ORDER BY transaction_date DESC';
        const result = await db.query(query, [professional_id]);
        res.status(200).json(result.rows);
    } catch (error) {
        next(error);
    }
};

// Deletar uma venda (opcional, dependendo dos requisitos do sistema)
const deleteSale = async (req, res, next) => {
    const { id } = req.params;
    try {
        const result = await db.query('DELETE FROM sales WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Venda não encontrada' });
        }
        res.status(200).json({ message: 'Venda deletada com sucesso' });
    } catch (err) {
        next(err);
    }
};

// Editar uma venda (opcional, dependendo dos requisitos do sistema)
const updateSale = async (req, res, next) => {
    const { id } = req.params;
    const { amount, payment_method } = req.body;
    try {
        const result = await db.query(
            'UPDATE sales SET amount = $1, payment_method = $2, transaction_date = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *',
            [amount, payment_method, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Venda não encontrada' });
        }
        res.status(200).json(result.rows[0]);
    } catch (err) {
        next(err);
    }
};

module.exports = {
    createSale,
    listSales,
    listSalesByProfessional,
    deleteSale,
    updateSale
};