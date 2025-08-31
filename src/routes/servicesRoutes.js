// src/routes/servicesRoutes.js

const { Router } = require('express');
const {
    createService,
    listServices,
    getServiceById,
    updateService,
    deleteService,
} = require('../controller/services');

const router = Router();

// Rota para listar (filtrado por estabelecimento) e criar um novo serviço
router.route('/')
    .get(listServices)
    .post(createService);

// Rotas para buscar, atualizar e deletar um serviço específico
router.route('/:id')
    .get(getServiceById)
    .put(updateService)
    .delete(deleteService);

module.exports = router;