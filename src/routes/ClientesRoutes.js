// Importa o módulo 'express' para criar rotas na aplicação
const express = require('express');
// Cria um novo roteador utilizando o Express
const router = express.Router();
// Importa o controlador de clientes
const clientesController = require('../controller/Clientes');

// Define as rotas para clientes
router.get('/', clientesController.getClientes);
router.post('/', clientesController.createCliente);
router.put('/:id', clientesController.updateCliente);
router.delete('/:id', clientesController.deleteCliente);

module.exports = router;
