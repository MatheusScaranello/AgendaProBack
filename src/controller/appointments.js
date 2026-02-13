const db = require('../config/dbConfig');

// GET /appointments
const getAll = async (req, res, next) => {
    try {
        const {
            rows
        } = await db.query('SELECT * FROM appointments ORDER BY start_time ASC');
        res.json(rows);
    } catch (err) {
        next(err);
    }
};

// GET /appointments/:id
const getById = async (req, res, next) => {
    const { id } = req.params;
    try {
        const {
            rows
        } = await db.query('SELECT * FROM appointments WHERE id = $1', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Agendamento não encontrado' });
        }
        res.json(rows[0]);
    } catch (err) {
        next(err);
    }
};

// POST /appointments
const create = async (req, res, next) => {
    const { client_id, professional_id, service_id, appointment_time } = req.body;
    const newId = require('uuid').v4(); // Gerar um UUID para o novo agendamento
    try {
        const result = await db.query(
            'INSERT INTO appointments (id, client_id, professional_id, service_id, appointment_time) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [newId, client_id, professional_id, service_id, appointment_time]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        next(err);
    }
};

// PUT /appointments/:id
const update = async (req, res, next) => {
    const { id } = req.params;
    const { client_id, professional_id, service_id, appointment_time, status } = req.body;
    try {
        const result = await db.query(
            'UPDATE appointments SET client_id = $1, professional_id = $2, service_id = $3, appointment_time = $4, status = $5, updated_at = CURRENT_TIMESTAMP WHERE id = $6 RETURNING *',
            [client_id, professional_id, service_id, appointment_time, status, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Agendamento não encontrado' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        next(err);
    }
};

// DELETE /appointments/:id
const deleteAppointment = async (req, res, next) => {
    const { id } = req.params;
    try {
        const result = await db.query('DELETE FROM appointments WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Agendamento não encontrado' });
        }
        res.status(204).send(); // Sucesso, sem conteúdo
    } catch (err) {
        next(err);
    }
};

// PATCH /appointments/:id/status
const updateStatus = async (req, res, next) => {
    const { id } = req.params;
    const { status } = req.body;
    try {
        const result = await db.query(
            'UPDATE appointments SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
            [status, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Agendamento não encontrado' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        next(err);
    }
};

// PATCH /appointments/:id/reschedule
const reschedule = async (req, res, next) => {
    const { id } = req.params;
    const { appointment_time } = req.body;
    try {
        const result = await db.query(
            'UPDATE appointments SET appointment_time = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
            [appointment_time, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Agendamento não encontrado' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        next(err);
    }
};

module.exports = {
    listAppointments,
    getAppointmentById,
    createAppointment,
    update, // Manter 'update' se for usado em outro lugar, ou renomear.
    deleteAppointment,
    updateStatus,
    reschedule,
};