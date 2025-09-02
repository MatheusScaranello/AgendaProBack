// src/controller/appointments.js

const db = require('../config/dbConfig');
const { v4: uuidv4 } = require('uuid');

/**
 * Cria um novo agendamento, verificando conflitos de horário.
 */
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
    const client = await db.query('BEGIN'); // Inicia a transação para garantir a consistência

    try {
        // 1. Busca o serviço para saber a duração e calcular o horário de término
        const serviceResult = await db.query('SELECT duration_minutes FROM services WHERE id = $1', [service_id]);
        if (serviceResult.rows.length === 0) {
            throw new Error('Serviço não encontrado');
        }
        const { duration_minutes } = serviceResult.rows[0];
        const startTimeDate = new Date(start_time);
        const endTimeDate = new Date(startTimeDate.getTime() + duration_minutes * 60000);

        // 2. Verifica se há conflitos de horário para o profissional
        const professionalConflictQuery = `
            SELECT id FROM appointments
            WHERE professional_id = $1
            AND status NOT IN ('Cancelado', 'No-Show')
            AND (start_time, end_time) OVERLAPS ($2, $3)
        `;
        const professionalConflictResult = await db.query(professionalConflictQuery, [professional_id, startTimeDate, endTimeDate]);

        if (professionalConflictResult.rows.length > 0) {
            throw new Error('Conflito de horário: O profissional já possui um agendamento neste período.');
        }
        
        // 3. ADICIONADO: Verifica se há conflitos de horário para o recurso (asset_id)
        if (asset_id) {
            const assetConflictQuery = `
                SELECT id FROM appointments
                WHERE asset_id = $1
                AND status NOT IN ('Cancelado', 'No-Show')
                AND (start_time, end_time) OVERLAPS ($2, $3)
            `;
            const assetConflictResult = await db.query(assetConflictQuery, [asset_id, startTimeDate, endTimeDate]);

            if (assetConflictResult.rows.length > 0) {
                throw new Error('Conflito de horário: O recurso (sala/equipamento) já está agendado neste período.');
            }
        }

        // 4. Se não houver conflitos, insere o novo agendamento
        const insertQuery = `
            INSERT INTO appointments (id, establishment_id, client_id, professional_id, service_id, asset_id, start_time, end_time, notes, status)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'Agendado')
            RETURNING *;
        `;
        const values = [newId, establishment_id, client_id, professional_id, service_id, asset_id, startTimeDate, endTimeDate, notes];
        const newAppointment = await db.query(insertQuery, values);

        await db.query('COMMIT'); // Confirma a transação
        res.status(201).json(newAppointment.rows[0]);
    } catch (error) {
        await db.query('ROLLBACK'); // Desfaz a transação em caso de erro
        res.status(409).json({ message: error.message });
    }
};

/**
 * Lista todos os agendamentos, com possibilidade de filtros.
 * Ex: /appointments?professional_id=uuid&date=2025-08-31
 */
const listAppointments = async (req, res, next) => {
    const { professional_id, client_id, date } = req.query;
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
    if (date) {
        conditions.push(`DATE(start_time) = $${counter++}`);
        values.push(date);
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

/**
 * Obtém um agendamento específico pelo ID.
 */
const getAppointmentById = async (req, res, next) => {
    const { id } = req.params;
    try {
        const result = await db.query('SELECT * FROM appointments WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Agendamento não encontrado.' });
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {
        next(error);
    }
};

/**
 * Atualiza o status de um agendamento e executa ações secundárias.
 */
const updateAppointmentStatus = async (req, res, next) => {
    const { id } = req.params;
    const { status } = req.body;
    
    const client = await db.query('BEGIN'); // Usa transação para garantir consistência

    try {
        const appointmentResult = await db.query(
            'SELECT a.*, s.price FROM appointments a JOIN services s ON a.service_id = s.id WHERE a.id = $1', [id]
        );
        if (appointmentResult.rows.length === 0) {
            throw new Error('Agendamento não encontrado');
        }
        const appointment = appointmentResult.rows[0];

        const updatedAppointment = await db.query(
            'UPDATE appointments SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
            [status, id]
        );

        if (status === 'Concluído') {
            // Cria uma venda e atualiza o ganho do cliente
            await db.query(
                'INSERT INTO sales (id, establishment_id, client_id, appointment_id, total_amount, final_amount, status) VALUES ($1, $2, $3, $4, $5, $5, \'Pago\')',
                [uuidv4(), appointment.establishment_id, appointment.client_id, id, appointment.price]
            );
            await db.query('UPDATE clients SET earned_income = earned_income + $1 WHERE id = $2', [appointment.price, appointment.client_id]);
        } else if (status === 'No-Show') {
            // Atualiza métricas de no-show e perda do cliente
            await db.query('UPDATE clients SET no_shows = no_shows + 1, lost_income = lost_income + $1 WHERE id = $2', [appointment.price, appointment.client_id]);
        } else if (status === 'Cancelado') {
            await db.query('UPDATE clients SET cancellations = cancellations + 1 WHERE id = $1', [appointment.client_id]);
        }
        
        await db.query('COMMIT');
        res.status(200).json(updatedAppointment.rows[0]);
    } catch (error) {
        await db.query('ROLLBACK');
        next(error);
    }
};

/**
 * Deleta um agendamento.
 */
const deleteAppointment = async (req, res, next) => {
    const { id } = req.params;
    try {
        const result = await db.query('DELETE FROM appointments WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Agendamento não encontrado.' });
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
    updateAppointmentStatus,
    deleteAppointment,
};