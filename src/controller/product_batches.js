// src/controller/product_batches.js

const db = require('../config/dbConfig');
const { v4: uuidv4 } = require('uuid');

/**
 * Cria um novo lote para um produto e atualiza o estoque geral do produto.
 */
const createProductBatch = async (req, res, next) => {
    const { product_id } = req.params; // ID do produto da rota aninhada
    const { batch_number, expiration_date, quantity } = req.body;
    const newId = uuidv4();

    if (!quantity || quantity <= 0) {
        return res.status(400).json({ message: 'A quantidade do lote deve ser um número positivo.' });
    }

    const client = await db.query('BEGIN'); // Inicia transação

    try {
        // 1. Insere o novo lote
        const batchQuery = `
            INSERT INTO product_batches (id, product_id, batch_number, expiration_date, quantity)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *;
        `;
        const batchValues = [newId, product_id, batch_number, expiration_date, quantity];
        const result = await db.query(batchQuery, batchValues);

        // 2. Atualiza o estoque na tabela principal de produtos
        const updateStockQuery = `
            UPDATE products SET stock_level = stock_level + $1 WHERE id = $2;
        `;
        await db.query(updateStockQuery, [quantity, product_id]);

        await db.query('COMMIT'); // Confirma a transação
        res.status(201).json(result.rows[0]);
    } catch (error) {
        await db.query('ROLLBACK'); // Desfaz em caso de erro
        if (error.code === '23503') {
            return res.status(404).json({ message: 'Produto não encontrado para adicionar o lote.' });
        }
        next(error);
    }
};

/**
 * Lista todos os lotes de um produto específico.
 */
const listBatchesByProduct = async (req, res, next) => {
    const { product_id } = req.params;
    try {
        const query = 'SELECT * FROM product_batches WHERE product_id = $1 ORDER BY created_at DESC';
        const result = await db.query(query, [product_id]);
        res.status(200).json(result.rows);
    } catch (error) {
        next(error);
    }
};

/**
 * Deleta um lote de produto e corrige o estoque geral.
 */
const deleteProductBatch = async (req, res, next) => {
    const { id } = req.params; // ID do lote

    const client = await db.query('BEGIN');

    try {
        // 1. Deleta o lote e retorna a linha deletada para saber a quantidade e o product_id
        const deleteQuery = 'DELETE FROM product_batches WHERE id = $1 RETURNING *';
        const result = await db.query(deleteQuery, [id]);

        if (result.rows.length === 0) {
            await db.query('ROLLBACK');
            return res.status(404).json({ message: 'Lote de produto não encontrado.' });
        }

        const { quantity, product_id } = result.rows[0];

        // 2. Subtrai a quantidade do lote do estoque principal do produto
        const updateStockQuery = `
            UPDATE products SET stock_level = stock_level - $1 WHERE id = $2;
        `;
        await db.query(updateStockQuery, [quantity, product_id]);

        await db.query('COMMIT');
        res.status(204).send();
    } catch (error) {
        await db.query('ROLLBACK');
        next(error);
    }
};


module.exports = {
    createProductBatch,
    listBatchesByProduct,
    deleteProductBatch,
};