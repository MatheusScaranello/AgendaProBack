// src/routes/sale_itemsRoutes.js

const { Router } = require('express'); // << ESTAVA FALTANDO
const {
    listItemsBySale,
    getSaleItemById,
} = require('../controller/sale_items');

// mergeParams: true é necessário para acessar o :sale_id da rota pai
const router = Router({ mergeParams: true }); // << ESTAVA FALTANDO

// Rota aninhada para listar todos os itens de uma venda específica
// Ex: GET /api/sales/uuid-da-venda/items
router.route('/')
    .get(listItemsBySale);

// Rota para buscar um item de venda específico pelo seu próprio ID
// Ex: GET /api/sale-items/uuid-do-item
router.route('/:id')
    .get(getSaleItemById);

module.exports = router;