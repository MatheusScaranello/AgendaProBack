// src/controller/appointments.js
const db = require('../config/dbConfig');
const {
    v4: uuidv4
} = require('uuid');

const createAppointment = async (req, res, next) => {
    const {
        establishment_id,
        client_id,
        professional_id,
        service_id,
        asset_id, // opcional
        start_time,
        notes
    } = req.body;

    const newId = uuidv4();

    try {
        await db.query('BEGIN');

        const serviceResult = await db.query('SELECT duration_minutes FROM services WHERE id = $1', [service_id]);
        if (serviceResult.rows.length === 0) {
            throw new Error('Serviço não encontrado');
        }
        const {
            duration_minutes
        } = serviceResult.rows[0];
        const startTimeDate = new Date(start_time);
        const endTimeDate = new Date(startTimeDate.getTime() + duration_minutes * 60000);

        const professionalConflictQuery = `
            SELECT id FROM appointments
            WHERE professional_id = $1
            AND status <> 'canceled'
            AND (start_time, end_time) OVERLAPS ($2, $3)
        `;
        const professionalConflictResult = await db.query(professionalConflictQuery, [professional_id, startTimeDate, endTimeDate]);

        if (professionalConflictResult.rows.length > 0) {
            throw new Error('Conflito de horário: O profissional já possui um agendamento neste período.');
        }

        if (asset_id) {
            const assetConflictQuery = `
                SELECT id FROM appointments
                WHERE asset_id = $1
                AND status <> 'canceled'
                AND (start_time, end_time) OVERLAPS ($2, $3)
            `;
            const assetConflictResult = await db.query(assetConflictQuery, [asset_id, startTimeDate, endTimeDate]);

            if (assetConflictResult.rows.length > 0) {
                throw new Error('Conflito de horário: O recurso (sala/equipamento) já está agendado neste período.');
            }
        }

        const insertQuery = `
            INSERT INTO appointments (id, establishment_id, client_id, professional_id, service_id, asset_id, start_time, end_time, notes, status)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'scheduled')
            RETURNING *;
        `;
        const values = [newId, establishment_id, client_id, professional_id, service_id, asset_id, startTimeDate, endTimeDate, notes];
        const newAppointment = await db.query(insertQuery, values);

        await db.query('COMMIT');
        res.status(201).json(newAppointment.rows[0]);
    } catch (error) {
        await db.query('ROLLBACK');
        res.status(409).json({
            message: error.message
        });
    }
};

const listAppointments = async (req, res, next) => {
    const {
        professional_id,
        client_id,
        start_date,
        end_date
    } = req.query;
    let query = 'SELECT * FROM appointments';
    const conditions = [];
    const values = [];
    let counter = 1;

    if (professional_id) {
        conditions.push(`professional_id = $${counter++}`);
        values.push(professional_id);
    }
    if (client_id) {
        conditions.push(`client_id = $${counter++}`);
        values.push(client_id);
    }
    if (start_date && end_date) {
        conditions.push(`start_time BETWEEN $${counter++} AND $${counter++}`);
        values.push(start_date, end_date);
    }

    if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
    }
    query += ' ORDER BY start_time ASC';

    try {
        const result = await db.query(query, values);
        res.status(200).json(result.rows);
    } catch (error) {
        next(error);
    }
};


const getAppointmentById = async (req, res, next) => {
    const {
        id
    } = req.params;
    try {
        const query = `
            SELECT 
                a.*, 
                c.full_name as client_name,
                c.phone as client_phone,
                s.name as service_name
            FROM appointments a
            JOIN clients c ON a.client_id = c.id
            JOIN services s ON a.service_id = s.id
            WHERE a.id = $1;
        `;
        const result = await db.query(query, [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({
                message: 'Agendamento não encontrado.'
            });
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {
        next(error);
    }
};

const updateStatus = async (req, res, next) => {
    const {
        id
    } = req.params;
    const {
        status
    } = req.body;

    const allowedStatus = ['scheduled', 'completed', 'canceled'];
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

        if (result.rows.length === 0) {
            await db.query('ROLLBACK');
            return res.status(404).json({
                message: 'Agendamento não encontrado.'
            });
        }
        
        console.log(`[LOG] Status do agendamento ${id} atualizado para ${status}.`);

        await db.query('COMMIT');
        res.status(200).json(result.rows[0]);
    } catch (error) {
        await db.query('ROLLBACK');
        console.error(`[ERROR] Erro ao atualizar status do agendamento ${id}:`, error);
        next(error);
    }
};

const reschedule = async (req, res, next) => {
    const {
        id
    } = req.params;
    const {
        new_start_time
    } = req.body;

    if (!new_start_time || isNaN(new Date(new_start_time))) {
        return res.status(400).json({
            message: 'A data e hora (new_start_time) são obrigatórias e devem estar no formato ISO 8601.'
        });
    }

    try {
        await db.query('BEGIN');

        const appointmentResult = await db.query('SELECT * FROM appointments WHERE id = $1 FOR UPDATE', [id]);
        if (appointmentResult.rows.length === 0) {
            throw new Error('Agendamento não encontrado.');
        }
        const appointment = appointmentResult.rows[0];

        const serviceResult = await db.query('SELECT duration_minutes FROM services WHERE id = $1', [appointment.service_id]);
        const {
            duration_minutes
        } = serviceResult.rows[0];

        const newStartTime = new Date(new_start_time);
        const newEndTime = new Date(newStartTime.getTime() + duration_minutes * 60000);

        const conflictQuery = `
            SELECT id FROM appointments
            WHERE professional_id = $1
            AND id <> $2
            AND status <> 'canceled'
            AND (start_time, end_time) OVERLAPS ($3, $4)
        `;
        const conflictResult = await db.query(conflictQuery, [appointment.professional_id, id, newStartTime, newEndTime]);

        if (conflictResult.rows.length > 0) {
            throw new Error('Conflito de horário: O profissional já possui um agendamento neste novo período.');
        }

        const updatedAppointment = await db.query(
            'UPDATE appointments SET start_time = $1, end_time = $2, status = $3, updated_at = NOW() WHERE id = $4 RETURNING *',
            [newStartTime, newEndTime, 'scheduled', id]
        );

        await db.query('COMMIT');
        console.log(`[LOG] Agendamento ${id} reagendado para ${newStartTime.toISOString()}`);
        res.status(200).json(updatedAppointment.rows[0]);
    } catch (error) {
        await db.query('ROLLBACK');
        res.status(409).json({
            message: error.message
        });
    }
};

const deleteAppointment = async (req, res, next) => {
    const {
        id
    } = req.params;
    try {
        const result = await db.query('DELETE FROM appointments WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({
                message: 'Agendamento não encontrado.'
            });
        }
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};


module.exports = {
    createAppointment,
    listAppointments,
    getAppointmentById,
    updateStatus,
    reschedule,
    deleteAppointment,
};
