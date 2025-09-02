const connection = require('../config/dbConfig');

async function getAllAppointments(req, res) {
    try {
        const result = await connection.query('SELECT * FROM appointments ORDER BY appointment_date, start_time');
        res.json(result.rows);
    } catch (error) {
        console.error("Erro ao buscar agendamentos:", error);
        res.status(500).json({ message: "Erro interno do servidor." });
    }
}

async function getAppointmentsByProfessionalAndDate(req, res) {
    const { professionalId, date } = req.params;
    try {
        const result = await connection.query('SELECT * FROM appointments WHERE professional_id = $1 AND appointment_date = $2 ORDER BY start_time', [professionalId, date]);
        res.json(result.rows);
    } catch (error) {
        console.error("Erro ao buscar agendamentos por profissional e data:", error);
        res.status(500).json({ message: "Erro interno do servidor." });
    }
}

async function createAppointment(req, res) {
    const { professional_id, client_id, service_id, appointment_date, start_time, end_time, asset_id } = req.body;

    try {
        // Verificação de conflito de horário para o profissional (adaptação para PostgreSQL)
        const professionalConflict = await connection.query(
            `SELECT * FROM appointments WHERE professional_id = $1 AND appointment_date = $2 AND (
                (start_time >= $3 AND start_time < $4) OR
                (end_time > $5 AND end_time <= $6) OR
                (start_time <= $7 AND end_time >= $8)
            )`,
            [professional_id, appointment_date, start_time, end_time, start_time, end_time, start_time, end_time]
        );

        if (professionalConflict.rows.length > 0) {
            return res.status(409).json({ message: 'Conflito de horário com outro agendamento para este profissional.' });
        }
        
        // Verificação de conflito de horário para o recurso (adaptação para PostgreSQL)
        if (asset_id) {
            const assetConflict = await connection.query(
                `SELECT * FROM appointments WHERE asset_id = $1 AND appointment_date = $2 AND (
                    (start_time >= $3 AND start_time < $4) OR
                    (end_time > $5 AND end_time <= $6) OR
                    (start_time <= $7 AND end_time >= $8)
                )`,
                [asset_id, appointment_date, start_time, end_time, start_time, end_time, start_time, end_time]
            );

            if (assetConflict.rows.length > 0) {
                return res.status(409).json({ message: 'Conflito de horário com outro agendamento para este recurso.' });
            }
        }
        
        // Inserir o novo agendamento, incluindo o asset_id
        const result = await connection.query(
            'INSERT INTO appointments (professional_id, client_id, service_id, appointment_date, start_time, end_time, status, notes, asset_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id',
            [professional_id, client_id, service_id, appointment_date, start_time, end_time, 'Agendado', null, asset_id]
        );

        const newId = result.rows[0].id;
        res.status(201).json({ id: newId, message: 'Agendamento criado com sucesso!' });
    } catch (error) {
        console.error("Erro ao criar agendamento:", error);
        res.status(500).json({ message: "Erro interno do servidor." });
    }
}

async function updateAppointmentStatus(req, res) {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !['Concluído', 'Cancelado', 'No-Show'].includes(status)) {
        return res.status(400).json({ message: "Status inválido fornecido." });
    }

    try {
        const result = await connection.query(
            'UPDATE appointments SET status = $1 WHERE id = $2',
            [status, id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Agendamento não encontrado." });
        }

        res.json({ message: "Status do agendamento atualizado com sucesso." });
    } catch (error) {
        console.error("Erro ao atualizar status do agendamento:", error);
        res.status(500).json({ message: "Erro interno do servidor." });
    }
}

async function deleteAppointment(req, res) {
    const { id } = req.params;
    try {
        const result = await connection.query(
            'DELETE FROM appointments WHERE id = $1',
            [id]
        );
        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Agendamento não encontrado." });
        }
        res.json({ message: "Agendamento excluído com sucesso." });
    } catch (error) {
        console.error("Erro ao excluir agendamento:", error);
        res.status(500).json({ message: "Erro interno do servidor." });
    }
}

module.exports = {
    getAllAppointments,
    getAppointmentsByProfessionalAndDate,
    createAppointment,
    updateAppointmentStatus,
    deleteAppointment
};