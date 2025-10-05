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
    const {
        id
    } = req.params;
    try {
        const {
            rows,
            rowCount
        } = await db.query('SELECT * FROM appointments WHERE id = $1', [id]);
        if (rowCount === 0) {
            return res.status(404).json({
                message: 'Agendamento não encontrado'
            });
        }
        res.json(rows[0]);
    } catch (err) {
        next(err);
    }
};

// POST /appointments
const create = async (req, res, next) => {
    const {
        client_id,
        professional_id,
        service_id,
        start_time,
        end_time,
        notes
    } = req.body;
    try {
        await db.query('BEGIN');

        // Adicione validações aqui (ex: verificar se o horário está disponível)

        const {
            rows
        } = await db.query(
            'INSERT INTO appointments (client_id, professional_id, service_id, start_time, end_time, notes, status) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            [client_id, professional_id, service_id, start_time, end_time, notes, 'Agendado']
        );

        await db.query('COMMIT');
        res.status(201).json(rows[0]);
    } catch (err) {
        await db.query('ROLLBACK');
        next(err);
    }
};

// PUT /appointments/:id
const update = async (req, res, next) => {
    const {
        id
    } = req.params;
    const {
        client_id,
        professional_id,
        service_id,
        start_time,
        end_time,
        notes
    } = req.body;
    try {
        await db.query('BEGIN');

        const {
            rows,
            rowCount
        } = await db.query(
            'UPDATE appointments SET client_id = $1, professional_id = $2, service_id = $3, start_time = $4, end_time = $5, notes = $6, updated_at = NOW() WHERE id = $7 RETURNING *',
            [client_id, professional_id, service_id, start_time, end_time, notes, id]
        );

        if (rowCount === 0) {
            await db.query('ROLLBACK');
            return res.status(404).json({
                message: 'Agendamento não encontrado'
            });
        }

        await db.query('COMMIT');
        res.json(rows[0]);
    } catch (err) {
        await db.query('ROLLBACK');
        next(err);
    }
};

// DELETE /appointments/:id
const remove = async (req, res, next) => {
    const {
        id
    } = req.params;
    try {
        await db.query('BEGIN');
        const {
            rowCount
        } = await db.query('DELETE FROM appointments WHERE id = $1', [id]);
        if (rowCount === 0) {
            await db.query('ROLLBACK');
            return res.status(404).json({
                message: 'Agendamento não encontrado'
            });
        }
        await db.query('COMMIT');
        res.status(204).send(); // No Content
    } catch (err) {
        await db.query('ROLLBACK');
        next(err);
    }
};


// PATCH /appointments/:id/status
const updateStatus = async (req, res, next) => {
    const {
        id
    } = req.params;
    const {
        status
    } = req.body;

    const allowedStatus = ['Agendado', 'Concluído', 'Cancelado', 'No-Show'];
    if (!status || !allowedStatus.includes(status)) {
        return res.status(400).json({
            message: `Status inválido. Use um dos seguintes: ${allowedStatus.join(', ')}`
        });
    }

    try {
        await db.query('BEGIN');

        const result = await db.query(
            'UPDATE appointments SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
            [status, id]
        );

        if (result.rowCount === 0) {
            await db.query('ROLLBACK');
            return res.status(404).json({
                message: 'Agendamento não encontrado'
            });
        }

        await db.query('COMMIT');
        res.json(result.rows[0]);
    } catch (err) {
        await db.query('ROLLBACK');
        next(err);
    }
};

// POST /appointments/:id/reschedule
const reschedule = async (req, res, next) => {
    const { id } = req.params;
    const { start_time, end_time } = req.body;

    if (!start_time || !end_time) {
        return res.status(400).json({ message: 'As novas datas de início e fim são obrigatórias.' });
    }

    try {
        const { rows, rowCount } = await db.query(
            'UPDATE appointments SET start_time = $1, end_time = $2, updated_at = NOW() WHERE id = $3 RETURNING *',
            [start_time, end_time, id]
        );

        if (rowCount === 0) {
            return res.status(404).json({ message: 'Agendamento não encontrado para reagendar.' });
        }

        res.json(rows[0]);
    } catch (err) {
        next(err);
    }
};

// Renomeando 'create' para 'createAppointment' para consistência
const createAppointment = create;
const deleteAppointment = remove;
const listAppointments = getAll;
const getAppointmentById = getById;


module.exports = {
    listAppointments,
    getAppointmentById,
    createAppointment,
    update, // Manter 'update' se for usado em outro lugar, ou renomear.
    deleteAppointment,
    updateStatus,
    reschedule,
};