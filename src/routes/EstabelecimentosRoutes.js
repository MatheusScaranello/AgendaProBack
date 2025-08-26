// Importa o módulo 'express' para criar rotas na aplicação
const express = require('express');
// Cria um novo roteador utilizando o Express
const router = express.Router();
// Importa o controlador de Estabelecimentos
const estabelecimentosController = require('../controller/Estabelecimento.js');

// Define as rotas para estabelecimentos
router.get('/', estabelecimentosController.getEstabelecimentos);
router.post('/', estabelecimentosController.createEstabelecimento);
router.put('/:id', estabelecimentosController.updateEstabelecimento);
router.delete('/:id', estabelecimentosController.deleteEstabelecimento);

module.exports = router;
