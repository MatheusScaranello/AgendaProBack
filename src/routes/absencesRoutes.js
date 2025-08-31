// src/routes/absencesRoutes.js

const { Router } = require('express');
const {
    createAbsence,
    getAbsencesByProfessional,
    updateAbsence,
    deleteAbsence,
} = require('../controller/absences');

// O 'mergeParams: true' é crucial para que este router tenha acesso
// aos parâmetros da rota pai (neste caso, o :professional_id)
const router = Router({ mergeParams: true });

// Estas rotas serão aninhadas sob /profissionais/:professional_id
router.get('/', getAbsencesByProfessional);
router.post('/', createAbsence);

// Estas rotas podem ser chamadas diretamente por /absences/:id
router.put('/:id', updateAbsence);
router.delete('/:id', deleteAbsence);


module.exports = router;