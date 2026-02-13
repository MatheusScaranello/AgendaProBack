// src/controller/services.js

const db = require('../config/dbConfig');
const { v4: uuidv4 } = require('uuid');

// CREATE TABLE services (
//     id UUID PRIMARY KEY,
//     professional_id UUID NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
//     name VARCHAR(255) NOT NULL,
//     description TEXT,
//     duration_minutes INT NOT NULL,
//     price NUMERIC(10, 2) NOT NULL,
//     is_active BOOLEAN DEFAULT TRUE,
//     created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
//     updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
// );

// Criar um novo serviço
async function createService(serviceData) {
    const { professional_id, name, description, duration_minutes, price } = serviceData;
    const id = uuidv4();
    const query = `INSERT INTO services (id, professional_id, name, description, duration_minutes, price) 
                   VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`;
    const values = [id, professional_id, name, description, duration_minutes, price];
    const { rows } = await db.query(query, values);
    return rows[0];
}

// Listar todos os serviços
async function listServices() {
    const query = `SELECT * FROM services WHERE is_active = TRUE`;
    const { rows } = await db.query(query);
    return rows;
}

// Obter um serviço por ID
async function getServiceById(id) {
    const query = `SELECT * FROM services WHERE id = $1 AND is_active = TRUE`;
    const { rows } = await db.query(query, [id]);
    return rows[0];
}

// Atualizar um serviço
async function updateService(id, serviceData) {
    const { professional_id, name, description, duration_minutes, price } = serviceData;
    const query = `UPDATE services 
                   SET professional_id = $1, name = $2, description = $3, duration_minutes = $4, price = $5, updated_at = CURRENT_TIMESTAMP 
                   WHERE id = $6 AND is_active = TRUE RETURNING *`;
    const values = [professional_id, name, description, duration_minutes, price, id];
    const { rows } = await db.query(query, values);
    return rows[0];
}

// Excluir um serviço (soft delete)
async function deleteService(id) {
    const query = `UPDATE services SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`;
    const { rows } = await db.query(query, [id]);
    return rows[0];
}


module.exports = {
    createService,
    listServices,
    getServiceById,
    updateService,
    deleteService
};