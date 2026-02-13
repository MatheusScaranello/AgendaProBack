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

router.post('/clients', createClient);
router.get('/clients', listClients);
router.get('/clients/:id', getClientById);
router.put('/clients/:id', updateClient);
router.delete('/clients/:id', deleteClient);

module.exports = router;