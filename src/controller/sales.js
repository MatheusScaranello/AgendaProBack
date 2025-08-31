// src/controller/sales.js

const db = require('../config/dbConfig');
const { v4: uuidv4 } = require('uuid');

/**
 * Cria uma nova venda e seus respectivos itens (sale_items) em uma única transação.
 */
const createSale = async (req, res, next) => {
    const {
        establishment_id,
        client_id,
        appointment_id, // opcional
        total_amount,
        discount,
        final_amount,
        payment_method,
        status,
        items // Espera-se um array de objetos: [{ service_id, product_id, quantity, unit_price, total_price }]
    } = req.body;

    const newSaleId = uuidv4();
    const client = await db.query('BEGIN'); // Inicia a transação

    try {
        // 1. Insere o registro principal da venda
        const saleQuery = `
            INSERT INTO sales (id, establishment_id, client_id, appointment_id, total_amount, discount, final_amount, payment_method, status)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING *;
        `;
        const saleValues = [newSaleId, establishment_id, client_id, appointment_id, total_amount, discount, final_amount, payment_method, status];
        const saleResult = await db.query(saleQuery, saleValues);

        // 2. Itera sobre os itens e os insere na tabela sale_items
        if (items && items.length > 0) {
            for (const item of items) {
                const newItemId = uuidv4();
                const itemQuery = `
                    INSERT INTO sale_items (id, sale_id, service_id, product_id, quantity, unit_price, total_price)
                    VALUES ($1, $2, $3, $4, $5, $6, $7);
                `;
                const itemValues = [newItemId, newSaleId, item.service_id, item.product_id, item.quantity, item.unit_price, item.total_price];
                await db.query(itemQuery, itemValues);
            }
        }

        await db.query('COMMIT'); // Confirma a transação
        res.status(201).json(saleResult.rows[0]);

    } catch (error) {
        await db.query('ROLLBACK'); // Desfaz tudo em caso de erro
        next(error);
    }
};

/**
 * Lista as vendas, com filtros por cliente ou estabelecimento.
 */
const listSales = async (req, res, next) => {
    const { establishment_id, client_id } = req.query;
    
    let query = `
        SELECT s.*, c.full_name as client_name 
        FROM sales s
        JOIN clients c ON s.client_id = c.id
    `;
    const values = [];
    const conditions = [];
    let counter = 1;

    if (establishment_id) {
        conditions.push(`s.establishment_id = $${counter++}`);
        values.push(establishment_id);
    }

    if (client_id) {
        conditions.push(`s.client_id = $${counter++}`);
        values.push(client_id);
    }

    if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ' ORDER BY s.transaction_date DESC';

    try {
        const result = await db.query(query, values);
        res.status(200).json(result.rows);
    } catch (error) {
        next(error);
    }
};

/**
 * Obtém uma venda específica pelo seu ID.
 */
const getSaleById = async (req, res, next) => {
    const { id } = req.params;
    try {
        const result = await db.query('SELECT * FROM sales WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Venda não encontrada.' });
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createSale,
    listSales,
    getSaleById,
};