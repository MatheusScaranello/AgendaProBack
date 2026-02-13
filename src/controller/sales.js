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

module.exports = {
    createSale,
    listSales,
    listSalesByProfessional
};