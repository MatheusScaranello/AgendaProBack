// src/controller/products.js

const db = require('../config/dbConfig');
const { v4: uuidv4 } = require('uuid');

/**
 * Cria um novo produto.
 */
const createProduct = async (req, res, next) => {
    const { establishment_id, name, sku, description, cost_price, sale_price, min_stock_level } = req.body;
    const newId = uuidv4();

    try {
        const query = `
            INSERT INTO products (id, establishment_id, name, sku, description, cost_price, sale_price, min_stock_level, stock_level)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 0)
            RETURNING *;
        `;
        const values = [newId, establishment_id, name, sku, description, cost_price, sale_price, min_stock_level];
        const result = await db.query(query, values);
        res.status(201).json(result.rows[0]);
    } catch (error) {
        if (error.code === '23505' && error.constraint === 'products_sku_key') {
            return res.status(409).json({ message: 'O SKU informado já está em uso.' });
        }
        next(error);
    }
};

/**
 * Lista todos os produtos de um estabelecimento.
 */
const listProducts = async (req, res, next) => {
    const { establishment_id } = req.query;
    if (!establishment_id) {
        return res.status(400).json({ message: 'O ID do estabelecimento (establishment_id) é obrigatório.' });
    }

    try {
        const query = 'SELECT * FROM products WHERE establishment_id = $1 ORDER BY name ASC';
        const result = await db.query(query, [establishment_id]);
        res.status(200).json(result.rows);
    } catch (error) {
        next(error);
    }
};

/**
 * Obtém um produto específico pelo seu ID.
 */
const getProductById = async (req, res, next) => {
    const { id } = req.params;
    try {
        const result = await db.query('SELECT * FROM products WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Produto não encontrado.' });
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {
        next(error);
    }
};

/**
 * Atualiza os dados de um produto.
 */
const updateProduct = async (req, res, next) => {
    const { id } = req.params;
    const { name, sku, description, cost_price, sale_price, min_stock_level } = req.body;
    try {
        const query = `
            UPDATE products
            SET name = $1, sku = $2, description = $3, cost_price = $4, sale_price = $5, min_stock_level = $6, updated_at = NOW()
            WHERE id = $7
            RETURNING *;
        `;
        const values = [name, sku, description, cost_price, sale_price, min_stock_level, id];
        const result = await db.query(query, values);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Produto não encontrado.' });
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {
        if (error.code === '23505' && error.constraint === 'products_sku_key') {
            return res.status(409).json({ message: 'O SKU informado já está em uso por outro produto.' });
        }
        next(error);
    }
};

/**
 * Deleta um produto.
 */
const deleteProduct = async (req, res, next) => {
    const { id } = req.params;
    try {
        // Idealmente, você verificaria se o produto tem lotes ou vendas associadas antes de deletar.
        const result = await db.query('DELETE FROM products WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Produto não encontrado.' });
        }
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createProduct,
    listProducts,
    getProductById,
    updateProduct,
    deleteProduct,
};