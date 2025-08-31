// src/routes/commissionsRoutes.js

const { Router } = require('express');
const {
    createCommission,
    listCommissions,
    getCommissionById,
} = require('../controller/commissions');

const router = Router();

// Rota para listar comissões (com filtros) e registrar uma nova
router.route('/')
    .get(listCommissions)
    .post(createCommission);

// Rota para buscar uma comissão específica
router.route('/:id')
    .get(getCommissionById);

module.exports = router;