// src/routes/product_batchesRoutes.js

const { Router } = require('express');
const {
    createProductBatch,
    listBatchesByProduct,
    deleteProductBatch,
} = require('../controller/product_batches');

// mergeParams: true é necessário para acessar o :product_id da rota pai
const router = Router({ mergeParams: true });

// Rotas aninhadas sob /products/:product_id
router.route('/')
    .get(listBatchesByProduct)
    .post(createProductBatch);

// Rota para deletar um lote específico pelo seu próprio ID
router.route('/:id')
    .delete(deleteProductBatch);

module.exports = router;