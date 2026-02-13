// src/controller/absences.js

const db = require('../config/dbConfig');
const { v4: uuidv4 } = require('uuid'); // Importa o gerador de UUID

/**
 * Cria um novo registro de ausência para um profissional.
 * O ID do profissional é pego da rota (ex: /profissionais/uuid-do-profissional/absences)
 */
const createAbsence = async (req, res, next) => {
    // O professional_id virá dos parâmetros da rota aninhada
    const { professional_id } = req.params;
    const { start_time, end_time, reason } = req.body;
    const newId = uuidv4(); // Gera o novo UUID no backend

    try {
        const result = await db.query(
            'INSERT INTO absences (id, professional_id, start_time, end_time, reason) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [newId, professional_id, start_time, end_time, reason]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        next(error);
    }
};

/**
 * Lista todas as ausências de um profissional específico.
 */
const getAbsencesByProfessional = async (req, res, next) => {
    const { professional_id } = req.params;
    try {
        const query = 'SELECT * FROM absences WHERE professional_id = $1 ORDER BY start_time DESC';
        const result = await db.query(query, [professional_id]);
        res.status(200).json(result.rows);
    } catch (error) {
        next(error);
    }
};

/**
 * Atualiza um registro de ausência pelo seu próprio ID.
 */
const updateAbsence = async (req, res, next) => {
    const { id } = req.params; // ID da ausência
    const { start_time, end_time, reason } = req.body;
    try {
        const query = `
            UPDATE absences
            SET start_time = $1, end_time = $2, reason = $3
            WHERE id = $4
            RETURNING *;
        `;
        const values = [start_time, end_time, reason, id];
        const result = await db.query(query, values);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Registro de ausência não encontrado.' });
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {
        next(error);
    }
};

/**
 * Deleta um registro de ausência pelo seu próprio ID.
 */
const deleteAbsence = async (req, res, next) => {
    const { id } = req.params; // ID da ausência
    try {
        const result = await db.query('DELETE FROM absences WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Registro de ausência não encontrado.' });
        }
        res.status(204).send(); // Sucesso, sem conteúdo
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createAbsence,
    getAbsencesByProfessional,
    updateAbsence,
    deleteAbsence,
};