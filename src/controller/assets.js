// src/controller/assets.js

const db = require('../config/dbConfig');
const { v4: uuidv4 } = require('uuid');

/**
 * Cria um novo ativo (sala ou equipamento).
 */
const createAsset = async (req, res, next) => {
    const { establishment_id, name, type, is_active } = req.body;
    const newId = uuidv4();

    try {
        const query = `
            INSERT INTO assets (id, establishment_id, name, type, is_active)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *;
        `;
        const values = [newId, establishment_id, name, type, is_active ?? true];
        const result = await db.query(query, values);
        res.status(201).json(result.rows[0]);
    } catch (error) {
        next(error);
    }
};

/**
 * Lista todos os ativos de um estabelecimento.
 */
const listAssets = async (req, res, next) => {
    // É uma boa prática filtrar por estabelecimento
    const { establishment_id } = req.query;
    if (!establishment_id) {
        return res.status(400).json({ message: 'O ID do estabelecimento (establishment_id) é obrigatório.' });
    }

    try {
        const query = 'SELECT * FROM assets WHERE establishment_id = $1 ORDER BY name ASC';
        const result = await db.query(query, [establishment_id]);
        res.status(200).json(result.rows);
    } catch (error) {
        next(error);
    }
};

/**
 * Obtém um ativo específico pelo seu ID.
 */
const getAssetById = async (req, res, next) => {
    const { id } = req.params;
    try {
        const result = await db.query('SELECT * FROM assets WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Ativo não encontrado.' });
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {
        next(error);
    }
};

/**
 * Atualiza os dados de um ativo.
 */
const updateAsset = async (req, res, next) => {
    const { id } = req.params;
    const { name, type, is_active } = req.body;
    try {
        const query = `
            UPDATE assets
            SET name = $1, type = $2, is_active = $3, updated_at = NOW()
            WHERE id = $4
            RETURNING *;
        `;
        const values = [name, type, is_active, id];
        const result = await db.query(query, values);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Ativo não encontrado.' });
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {
        next(error);
    }
};

/**
 * Deleta um ativo.
 */
const deleteAsset = async (req, res, next) => {
    const { id } = req.params;
    try {
        const result = await db.query('DELETE FROM assets WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Ativo não encontrado.' });
        }
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createAsset,
    listAssets,
    getAssetById,
    updateAsset,
    deleteAsset,
};