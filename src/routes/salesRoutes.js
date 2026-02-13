// src/routes/salesRoutes.js

const { Router } = require('express');
const {
    createSale,
    listSales,
    getSaleById,
} = require('../controller/sales');

const router = Router();

// Create a new sale
router.post('/', createSale);
// List all sales
router.get('/', listSales);
// Get a sale by ID
router.get('/:id', getSaleById);

module.exports = router;

