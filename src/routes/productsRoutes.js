// src/routes/productsRoutes.js

const { Router } = require('express');
const {
    createProduct,
    listProducts,
    getProductById,
    updateProduct,
    deleteProduct,
} = require('../controller/products');

// Importa o router de lotes para aninhar
const productBatchesRouter = require('./product_batchesRoutes');

const router = Router();

// Rota para listar (filtrado por estabelecimento) e criar um novo produto
router.route('/')
    .get(listProducts)
    .post(createProduct);

// Rotas para buscar, atualizar e deletar um produto específico
router.route('/:id')
    .get(getProductById)
    .put(updateProduct)
    .delete(deleteProduct);

// --- Aninhamento de Rotas ---
// Informa ao router de produtos para usar o router de lotes
// sempre que uma URL como /:product_id/batches for acessada.
// O nome do parâmetro (:product_id) deve corresponder ao que o controller de lotes espera.
router.use('/:product_id/batches', productBatchesRouter);


module.exports = router;