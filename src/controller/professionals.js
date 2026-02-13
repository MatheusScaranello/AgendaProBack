// src/controller/professionals.js

const db = require('../config/dbConfig');
const { v4: uuidv4 } = require('uuid');

// CREATE TABLE professionals (
//     id UUID PRIMARY KEY,
//     full_name VARCHAR(255) NOT NULL,
//     phone VARCHAR(20),
//     email VARCHAR(255) UNIQUE,
//     role VARCHAR(100),
//     is_active BOOLEAN DEFAULT TRUE,
//     created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
//     updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
// );

// Criar um novo profissional
async function createProfessional(professionalData) {
    const { full_name, phone, email, role } = professionalData;
    const id = uuidv4();   
    const query = `INSERT INTO professionals (id, full_name, phone, email, role) 
                   VALUES ($1, $2, $3, $4, $5) RETURNING *`;
    const values = [id, full_name, phone, email, role];
    const { rows } = await db.query(query, values);
    return rows[0];
}

// Listar todos os profissionais
async function listProfessionals() {
    const query = `SELECT * FROM professionals WHERE is_active = TRUE`;
    const { rows } = await db.query(query);
    return rows;
}

// Obter um profissional por ID
async function getProfessionalById(id) {
    const query = `SELECT * FROM professionals WHERE id = $1 AND is_active = TRUE`;
    const { rows } = await db.query(query, [id]);
    return rows[0];
}

// Atualizar um profissional
async function updateProfessional(id, professionalData) {
    const { full_name, phone, email, role } = professionalData; 
    const query = `UPDATE professionals 
                   SET full_name = $1, phone = $2, email = $3, role = $4, updated_at = CURRENT_TIMESTAMP 
                   WHERE id = $5 AND is_active = TRUE RETURNING *`;
    const values = [full_name, phone, email, role, id];
    const { rows } = await db.query(query, values);
    return rows[0];
}

// Excluir um profissional (soft delete)
async function deleteProfessional(id) {
    const query = `UPDATE professionals SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`;
    const { rows } = await db.query(query, [id]);
    return rows[0];
}


module.exports = {
    createProfessional,
    listProfessionals,
    getProfessionalById,
    updateProfessional,
    deleteProfessional
};