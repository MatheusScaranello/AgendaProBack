// src/routes/appointmentsRoutes.js

const { Router } = require('express');
const {
    createAppointment,
    listAppointments,
    getAppointmentById,
    updateAppointmentStatus,
    deleteAppointment,
} = require('../controller/appointments');

const router = Router();

// Rota para listar agendamentos (com filtros via query string) e criar um novo
router.route('/')
    .get(listAppointments)
    .post(createAppointment);

// Rota para buscar, atualizar status e deletar um agendamento específico
router.route('/:id')
    .get(getAppointmentById)
    .delete(deleteAppointment);

// Rota específica para atualizar apenas o status
router.patch('/:id/status', updateAppointmentStatus);

module.exports = router;