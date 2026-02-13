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
router.get('/sales/professional/:professional_id', listSalesByProfessional);

module.exports = router;

