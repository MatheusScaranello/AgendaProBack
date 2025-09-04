const db = require('../config/dbConfig');

// --- OPERAÇÃO SUPREMA: BUSCAR AGENDAMENTOS COM DADOS RELACIONADOS ---
const getAllAppointments = async (req, res) => {
    try {
        const { professional_id, establishment_id, start_date, end_date, client_id, service_id, status } = req.query;

        // A base da nossa query agora une as 3 tabelas essenciais.
        let query = `
            SELECT 
                a.*,
                c.id as client_nested_id,
                c.full_name as client_name,
                c.phone as client_phone,
                s.id as service_nested_id,
                s.name as service_name,
                s.price as service_price,
                s.duration_minutes as service_duration
            FROM appointments a
            LEFT JOIN clients c ON a.client_id = c.id
            LEFT JOIN services s ON a.service_id = s.id
        `;
        
        const whereClauses = [];
        const queryParams = [];

        if (professional_id) {
            whereClauses.push('a.professional_id = ?');
            queryParams.push(professional_id);
        }
        if (establishment_id) {
            whereClauses.push('a.establishment_id = ?');
            queryParams.push(establishment_id);
        }
        if (client_id) {
            whereClauses.push('a.client_id = ?');
            queryParams.push(client_id);
        }
        if (service_id) {
            whereClauses.push('a.service_id = ?');
            queryParams.push(service_id);
        }
        if (status) {
            whereClauses.push('a.status = ?');
            queryParams.push(status);
        }
        if (start_date && end_date) {
            whereClauses.push('DATE(a.start_time) BETWEEN ? AND ?');
            queryParams.push(start_date, end_date);
        } else if (start_date) {
            whereClauses.push('DATE(a.start_time) = ?');
            queryParams.push(start_date);
        }

        if (whereClauses.length > 0) {
            query += ' WHERE ' + whereClauses.join(' AND ');
        }

        query += ' ORDER BY a.start_time ASC';

        const [rows] = await db.query(query, queryParams);

        // Mapeia o resultado "plano" do SQL para a estrutura aninhada que o frontend precisa.
        const appointments = rows.map(row => {
            const { 
                client_nested_id, client_name, client_phone,
                service_nested_id, service_name, service_price, service_duration,
                ...appointmentData 
            } = row;

            return {
                ...appointmentData,
                client: {
                    id: client_nested_id,
                    full_name: client_name,
                    phone: client_phone
                },
                service: {
                    id: service_nested_id,
                    name: service_name,
                    price: service_price,
                    duration_minutes: service_duration
                }
            };
        });

        if (appointments.length === 0) {
            return res.status(404).json({ message: 'Nenhum agendamento encontrado para os critérios fornecidos.' });
        }

        res.json(appointments);
    } catch (error) {
        console.error("Erro ao buscar agendamentos:", error);
        res.status(500).json({ message: 'Erro interno do servidor ao processar sua solicitação.' });
    }
};

// ... (Restante do arquivo: getAppointmentById, createAppointment, updateAppointment, deleteAppointment) ...

const getAppointmentById = async (req, res) => {
    try {
        const { id } = req.params;
        const query = `
            SELECT 
                a.*,
                c.id as client_nested_id, c.full_name as client_name, c.phone as client_phone,
                s.id as service_nested_id, s.name as service_name, s.price as service_price, s.duration_minutes as service_duration
            FROM appointments a
            LEFT JOIN clients c ON a.client_id = c.id
            LEFT JOIN services s ON a.service_id = s.id
            WHERE a.id = ?
        `;
        const [rows] = await db.query(query, [id]);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Agendamento não encontrado' });
        }

        const row = rows[0];
        const { 
            client_nested_id, client_name, client_phone,
            service_nested_id, service_name, service_price, service_duration,
            ...appointmentData 
        } = row;

        const appointment = {
            ...appointmentData,
            client: { id: client_nested_id, full_name: client_name, phone: client_phone },
            service: { id: service_nested_id, name: service_name, price: service_price, duration_minutes: service_duration }
        };
        
        res.json(appointment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createAppointment = async (req, res) => {
    try {
        const { establishment_id, professional_id, client_id, service_id, start_time, notes } = req.body;

        // Validação de dados essenciais
        if (!establishment_id || !professional_id || !client_id || !service_id || !start_time) {
            return res.status(400).json({ message: 'Todos os campos obrigatórios devem ser preenchidos.' });
        }

        // Busca a duração do serviço para calcular o end_time
        const [services] = await db.query('SELECT duration_minutes FROM services WHERE id = ?', [service_id]);
        if (services.length === 0) {
            return res.status(404).json({ message: 'Serviço não encontrado.' });
        }
        const duration = services[0].duration_minutes;
        const startTimeObj = new Date(start_time);
        const endTimeObj = new Date(startTimeObj.getTime() + duration * 60000);

        const newAppointment = {
            establishment_id,
            professional_id,
            client_id,
            service_id,
            start_time: startTimeObj,
            end_time: endTimeObj,
            status: 'Agendado', // Status padrão
            notes
        };

        const query = 'INSERT INTO appointments SET ?';
        const [result] = await db.query(query, newAppointment);
        res.status(201).json({ id: result.insertId, ...newAppointment });
    } catch (error) {
        console.error("Erro ao criar agendamento:", error);
        res.status(500).json({ message: error.message });
    }
};

const updateAppointment = async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await db.query('UPDATE appointments SET ? WHERE id = ?', [req.body, id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Agendamento não encontrado' });
        }
        res.json({ message: 'Agendamento atualizado com sucesso' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteAppointment = async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await db.query('DELETE FROM appointments WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Agendamento não encontrado' });
        }
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAllAppointments,
    getAppointmentById,
    createAppointment,
    updateAppointment,
    deleteAppointment,
};