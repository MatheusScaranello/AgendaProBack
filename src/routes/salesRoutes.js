// src/routes/salesRoutes.js

const { Router } = require('express');
const {
    createSale,
    listSales,
    listSalesByProfessional
} = require('../controller/sales');

const router = Router();

router.post('/sales', createSale);
router.get('/sales', listSales);
router.get('/professionals/:professional_id/sales', listSalesByProfessional);

module.exports = router;

