// src/controller/sale_items.js

const db = require('../config/dbConfig');

/**
 * Lista todos os itens de uma venda específica.
 */
const listItemsBySale = async (req, res, next) => {
    const { sale_id } = req.params; // ID da venda vindo da rota aninhada
    try {
        const query = `
            SELECT 
                si.id, 
                si.quantity, 
                si.unit_price, 
                si.total_price, 
                s.name as service_name, 
                p.name as product_name 
            FROM sale_items si
            LEFT JOIN services s ON si.service_id = s.id
            LEFT JOIN products p ON si.product_id = p.id
            WHERE si.sale_id = $1
            ORDER BY s.name, p.name;
        `;
        const result = await db.query(query, [sale_id]);
        res.status(200).json(result.rows);
    } catch (error) {
        next(error);
    }
};

/**
 * Obtém um item de venda específico pelo seu ID.
 */
const getSaleItemById = async (req, res, next) => {
    const { id } = req.params;
    try {
        const result = await db.query('SELECT * FROM sale_items WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Item de venda não encontrado.' });
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    listItemsBySale,
    getSaleItemById,
};