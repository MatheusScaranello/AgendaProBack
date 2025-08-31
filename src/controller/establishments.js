// src/controller/establishments.js

const db = require('../config/dbConfig');
const { v4: uuidv4 } = require('uuid');

/**
 * Cria um novo estabelecimento.
 */
const createEstablishment = async (req, res, next) => {
    const { name, trade_name, phone, email, address, plan } = req.body;
    const newId = uuidv4();

    try {
        const query = `
            INSERT INTO establishments (id, name, trade_name, phone, email, address, plan)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *;
        `;
        const values = [newId, name, trade_name, phone, email, address, plan];
        const result = await db.query(query, values);
        res.status(201).json(result.rows[0]);
    } catch (error) {
        if (error.code === '23505' && error.constraint === 'establishments_email_key') {
            return res.status(409).json({ message: 'O e-mail informado já está em uso.' });
        }
        next(error);
    }
};

/**
 * Lista todos os estabelecimentos.
 */
const listEstablishments = async (req, res, next) => {
    try {
        const result = await db.query('SELECT * FROM establishments ORDER BY name ASC');
        res.status(200).json(result.rows);
    } catch (error) {
        next(error);
    }
};

/**
 * Obtém um estabelecimento específico pelo seu ID.
 */
const getEstablishmentById = async (req, res, next) => {
    const { id } = req.params;
    try {
        const result = await db.query('SELECT * FROM establishments WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Estabelecimento não encontrado.' });
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {
        next(error);
    }
};

/**
 * Atualiza os dados de um estabelecimento.
 */
const updateEstablishment = async (req, res, next) => {
    const { id } = req.params;
    const { name, trade_name, phone, email, address, plan } = req.body;
    try {
        const query = `
            UPDATE establishments
            SET name = $1, trade_name = $2, phone = $3, email = $4, address = $5, plan = $6, updated_at = NOW()
            WHERE id = $7
            RETURNING *;
        `;
        const values = [name, trade_name, phone, email, address, plan, id];
        const result = await db.query(query, values);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Estabelecimento não encontrado.' });
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {
        if (error.code === '23505' && error.constraint === 'establishments_email_key') {
            return res.status(409).json({ message: 'O e-mail informado já está em uso por outro estabelecimento.' });
        }
        next(error);
    }
};

/**
 * Deleta um estabelecimento.
 */
const deleteEstablishment = async (req, res, next) => {
    const { id } = req.params;
    try {
        const result = await db.query('DELETE FROM establishments WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Estabelecimento não encontrado.' });
        }
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createEstablishment,
    listEstablishments,
    getEstablishmentById,
    updateEstablishment,
    deleteEstablishment,
};