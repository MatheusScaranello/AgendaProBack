// src/routes/assetsRoutes.js

const { Router } = require('express');
const {
    createAsset,
    listAssets,
    getAssetById,
    updateAsset,
    deleteAsset,
} = require('../controller/assets');

const router = Router();

// Rota para listar (filtrado por estabelecimento) e criar um novo ativo
router.route('/')
    .get(listAssets)
    .post(createAsset);

// Rotas para buscar, atualizar e deletar um ativo específico
router.route('/:id')
    .get(getAssetById)
    .put(updateAsset)
    .delete(deleteAsset);

module.exports = router;