// src/routes/salesRoutes.js

const { Router } = require('express');
const {
    createSale,
    listSales,
    getSaleById,
} = require('../controller/sales');

// Importa o router de itens para aninhar
const saleItemsRouter = require('./sale_itemsRoutes');

const router = Router();

// Rota para listar vendas (com filtros) e criar uma nova
router.route('/')
    .get(listSales)
    .post(createSale);

// Rota para buscar uma venda específica
router.route('/:id')
    .get(getSaleById);

// --- Aninhamento de Rotas ---
// Informa ao router de vendas para usar o router de itens
// sempre que uma URL como /:sale_id/items for acessada.
router.use('/:sale_id/items', saleItemsRouter);

module.exports = router;