// src/routes/professionalsRoutes.js

const { Router } = require('express');
const {
    createProfessional,
    listProfessionals,
    getProfessionalById,
    updateProfessional,
    deleteProfessional
} = require('../controller/professionals');

const router = Router();

// Rota para listar (filtrado por estabelecimento) e criar um novo profissional
router.post('/professionals', createProfessional);
router.get('/professionals', listProfessionals);
// Rotas para buscar, atualizar e deletar um profissional específico
router.get('/professionals/:id', getProfessionalById);
router.put('/professionals/:id', updateProfessional);
router.delete('/professionals/:id', deleteProfessional);

module.exports = router;