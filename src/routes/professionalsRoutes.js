// src/routes/professionalsRoutes.js

const { Router } = require('express');
const {
    createProfessional,
    listProfessionals,
    getProfessionalById,
    updateProfessional,
    deleteProfessional,
    associateService,
    listServicesByProfessional,
} = require('../controller/professionals');

// Importa os routers que serão aninhados
const absencesRouter = require('./absencesRoutes');

const router = Router();

// Rota para listar (filtrado por estabelecimento) e criar um novo profissional
router.route('/')
    .get(listProfessionals)
    .post(createProfessional);

// Rotas para buscar, atualizar e deletar um profissional específico
router.route('/:id')
    .get(getProfessionalById)
    .put(updateProfessional)
    .delete(deleteProfessional);

// Rotas para associar e listar serviços de um profissional
router.route('/:professional_id/services')
    .get(listServicesByProfessional)
    .post(associateService);

// --- Aninhamento de Rotas ---
// Informa ao router de profissionais para usar o router de ausências
// sempre que uma URL como /:professional_id/absences for acessada.
router.use('/:professional_id/absences', absencesRouter);

module.exports = router;