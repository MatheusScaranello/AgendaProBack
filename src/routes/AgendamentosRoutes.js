// Importa o módulo 'express' para criar rotas na aplicação
const express = require('express');
// Cria um novo roteador utilizando o Express
const router = express.Router();
// Importa o controlador de agendamentos
const agendamentosController = require('../controller/Agendamentos');

// Define as rotas para agendamentos
router.get('/', agendamentosController.getAgendamentos);
router.post('/', agendamentosController.createAgendamento);
router.put('/:id', agendamentosController.updateAgendamento);
router.delete('/:id', agendamentosController.deleteAgendamento);

module.exports = router;