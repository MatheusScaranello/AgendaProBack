// src/routes/cash_flowRoutes.js

const { Router } = require('express');
const {
    createCashFlowEntry,
    listCashFlow,
    deleteCashFlowEntry,
} = require('../controller/cash_flow');

const router = Router();

// Rota para listar (com filtros) e criar uma nova entrada
router.route('/')
    .get(listCashFlow)
    .post(createCashFlowEntry);

// Rota para deletar uma entrada específica
router.route('/:id')
    .delete(deleteCashFlowEntry);


module.exports = router;