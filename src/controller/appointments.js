const db = require('../config/dbConfig');

// CREATE TABLE appointments (
//     id UUID PRIMARY KEY,
//     client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
//     professional_id UUID NOT NULL REFERENCES professionals(id) ON DELETE RESTRICT,
//     service_id UUID NOT NULL REFERENCES services(id) ON DELETE RESTRICT,
//     appointment_time TIMESTAMP WITH TIME ZONE NOT NULL,
//     status VARCHAR(50) DEFAULT 'scheduled',
//     created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
//     updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP  
// );

// Create a new appointment
async function createAppointment(req, res) {
    const { client_id, professional_id, service_id, appointment_time } = req.body;

    try {
        const result = await db.query(
            `INSERT INTO appointments (client_id, professional_id, service_id, appointment_time) 
             VALUES ($1, $2, $3, $4) RETURNING *`,
            [client_id, professional_id, service_id, appointment_time]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao criar agendamento' });
    }
}

// Additional functions for listing, updating, and deleting appointments can be added here
async function listAppointments(req, res) {
    try {
        const result = await db.query('SELECT * FROM appointments');
        res.status(200).json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao listar agendamentos' });
    }
}

async function updateAppointment(req, res) {
    const { id } = req.params;
    const { status } = req.body;
    try {
        const result = await db.query(
            `UPDATE appointments SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *`,
            [status, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Agendamento não encontrado' });
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao atualizar agendamento' });
    }
}

async function deleteAppointment(req, res) {
    const { id } = req.params;
    try {
        const result = await db.query('DELETE FROM appointments WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Agendamento não encontrado' });
        }
        res.status(200).json({ message: 'Agendamento deletado com sucesso' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao deletar agendamento' });
    }
}

module.exports = {
    createAppointment,
    listAppointments,
    updateAppointment,
    deleteAppointment
};