// src/routes/clientsRoutes.js

const { Router } = require('express');
const {
    createClient,
    listClients,
    getClientById,
    updateClient,
    deleteClient,
} = require('../controller/clients');

const router = Router();

// Rota para listar (filtrado por estabelecimento) e criar um novo cliente
router.route('/')
    .get(listClients)
    .post(createClient);

// Rotas para buscar, atualizar e deletar um cliente específico
router.route('/:id')
    .get(getClientById)
    .put(updateClient)
    .delete(deleteClient);

module.exports = router;