// src/routes/establishmentsRoutes.js

const { Router } = require('express');
const {
    createEstablishment,
    listEstablishments,
    getEstablishmentById,
    updateEstablishment,
    deleteEstablishment,
} = require('../controller/establishments');

const router = Router();

// Rota para listar e criar um novo estabelecimento
router.route('/')
    .get(listEstablishments)
    .post(createEstablishment);

// Rotas para buscar, atualizar e deletar um estabelecimento específico
router.route('/:id')
    .get(getEstablishmentById)
    .put(updateEstablishment)
    .delete(deleteEstablishment);

module.exports = router;