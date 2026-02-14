// src/routes/salesRoutes.js

const { Router } = require('express');
const {
    createSale,
    listSales,
    listSalesByProfessional,
    deleteSale,
    updateSale
} = require('../controller/sales');

const router = Router();

router.post('/sales', createSale);
router.get('/sales', listSales);
router.get('/sales/professional/:professional_id', listSalesByProfessional);
router.delete('/sales/:id', deleteSale);
router.put('/sales/:id', updateSale);

module.exports = router;

