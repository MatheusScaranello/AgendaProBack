// src/routes/establishmentsRoutes.js

const { Router } = require('express');
const {
    createEstablishment,
    listEstablishments,
    getEstablishmentById,
    updateEstablishment,
    deleteEstablishment,
    loginEstablishment,
    getEstablishmentByEmail, // << IMPORTE AQUI
} = require('../controller/establishments');

const router = Router();

// Rota para listar e criar um novo estabelecimento
router.route('/')
    .get(listEstablishments)
    .post(createEstablishment);

// Rota específica para buscar por e-mail
// Ex: GET /api/establishments/email/contato@exemplo.com
router.get('/email/:email', getEstablishmentByEmail);

// Rotas para buscar, atualizar e deletar um estabelecimento específico por ID
router.route('/:id')
    .get(getEstablishmentById)
    .put(updateEstablishment)
    .delete(deleteEstablishment);


// Rota para autenticação
router.post('/login', loginEstablishment);

module.exports = router;