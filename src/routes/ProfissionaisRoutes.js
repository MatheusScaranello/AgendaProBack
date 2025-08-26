// Importa o módulo 'express' para criar rotas na aplicação
const express = require('express');
// Cria um novo roteador utilizando o Express
const router = express.Router();
// Importa o controlador de Profissionais
const profissionaisController = require('../controller/Profissionais');

// Define as rotas para profissionais
router.get('/', profissionaisController.getProfissionais);
router.post('/', profissionaisController.createProfissional);
router.put('/:id', profissionaisController.updateProfissional);
router.delete('/:id', profissionaisController.deleteProfissional);

module.exports = router;
