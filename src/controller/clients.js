const db = require('../config/dbConfig');
const { v4: uuidv4 } = require('uuid');

/**
 * @description Função auxiliar para enriquecer um objeto de cliente com métricas de vendas e agendamentos.
 * @param {object} client - O objeto do cliente a ser enriquecido.
 * @returns {Promise<object>} O cliente com dados adicionais (total_spent, avg_ticket, last_appointment).
 */
const enrichClientWithMetrics = async (client) => {
    // Query para calcular o total gasto e o ticket médio a partir da tabela de vendas
    const salesQuery = `
        SELECT
            COALESCE(SUM(final_amount), 0) AS total_spent,
            COALESCE(AVG(final_amount), 0) AS avg_ticket
        FROM sales
        WHERE client_id = $1;
    `;
    const salesResult = await db.query(salesQuery, [client.id]);

    // Query para encontrar a data do último agendamento
    const lastAppointmentQuery = `
        SELECT start_time 
        FROM appointments 
        WHERE client_id = $1 
        ORDER BY start_time DESC 
        LIMIT 1;
    `;
    const lastAppointmentResult = await db.query(lastAppointmentQuery, [client.id]);

    // Combina os dados originais do cliente com as novas métricas calculadas
    return {
        ...client,
        total_spent: parseFloat(salesResult.rows[0].total_spent) || 0,
        avg_ticket: parseFloat(salesResult.rows[0].avg_ticket) || 0,
        last_appointment: lastAppointmentResult.rows.length > 0 ? lastAppointmentResult.rows[0].start_time : null,
    };
};

/**
 * Cria um novo cliente.
 */
const createClient = async (req, res, next) => {
    const { establishment_id, full_name, phone, email, birth_date, address } = req.body;
    const newId = uuidv4();

    try {
        const query = `
            INSERT INTO clients (id, establishment_id, full_name, phone, email, birth_date, address)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *;
        `;
        const values = [newId, establishment_id, full_name, phone, email, birth_date, address];
        const result = await db.query(query, values);
        res.status(201).json(result.rows[0]);
    } catch (error) {
        if (error.code === '23505' && error.constraint === 'clients_email_key') {
            return res.status(409).json({ message: 'O e-mail informado já está em uso.' });
        }
        next(error);
    }
};

/**
 * Lista todos os clientes de um estabelecimento, com dados de vendas agregados.
 */
const listClients = async (req, res, next) => {
    const { establishment_id } = req.query;
    if (!establishment_id) {
        return res.status(400).json({ message: 'O ID do estabelecimento (establishment_id) é obrigatório.' });
    }

    try {
        const query = 'SELECT * FROM clients WHERE establishment_id = $1 ORDER BY full_name ASC';
        const result = await db.query(query, [establishment_id]);

        // Enriquece cada cliente com as métricas de forma paralela para melhor performance
        const enrichedClients = await Promise.all(result.rows.map(enrichClientWithMetrics));
        
        res.status(200).json(enrichedClients);
    } catch (error) {
        next(error);
    }
};

/**
 * Obtém um cliente específico pelo seu ID, enriquecido com dados de vendas.
 */
const getClientById = async (req, res, next) => {
    const { id } = req.params;
    try {
        const result = await db.query('SELECT * FROM clients WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Cliente não encontrado.' });
        }
        
        const enrichedClient = await enrichClientWithMetrics(result.rows[0]);
        res.status(200).json(enrichedClient);
    } catch (error) {
        next(error);
    }
};

/**
 * Atualiza os dados de um cliente.
 */
const updateClient = async (req, res, next) => {
    const { id } = req.params;
    const { full_name, phone, email, birth_date, address } = req.body;
    try {
        const query = `
            UPDATE clients
            SET full_name = $1, phone = $2, email = $3, birth_date = $4, address = $5, updated_at = NOW()
            WHERE id = $6
            RETURNING *;
        `;
        const values = [full_name, phone, email, birth_date, address, id];
        const result = await db.query(query, values);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Cliente não encontrado.' });
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {
        if (error.code === '23505' && error.constraint === 'clients_email_key') {
            return res.status(409).json({ message: 'O e-mail informado já está em uso por outro cliente.' });
        }
        next(error);
    }
};

/**
 * Deleta um cliente, verificando se há dependências em agendamentos ou vendas.
 */
const deleteClient = async (req, res, next) => {
    const { id } = req.params;
    try {
        // Verifica se o cliente possui agendamentos
        const appointments = await db.query('SELECT id FROM appointments WHERE client_id = $1 LIMIT 1', [id]);
        if (appointments.rows.length > 0) {
            return res.status(409).json({ message: 'Não é possível excluir o cliente, pois ele possui agendamentos associados.' });
        }

        // Verifica se o cliente possui vendas
        const sales = await db.query('SELECT id FROM sales WHERE client_id = $1 LIMIT 1', [id]);
        if (sales.rows.length > 0) {
            return res.status(409).json({ message: 'Não é possível excluir o cliente, pois ele possui vendas associadas.' });
        }

        const result = await db.query('DELETE FROM clients WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Cliente não encontrado.' });
        }
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createClient,
    listClients,
    getClientById,
    updateClient,
    deleteClient,
};