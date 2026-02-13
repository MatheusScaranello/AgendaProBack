// src/routes/appointmentsRoutes.js

const {
    Router
} = require('express');
const {
    listAppointments,
    getAppointmentById,
    createAppointment,
    update, // Manter 'update' se for usado em outro lugar, ou renomear.
    deleteAppointment,
    updateStatus,
    reschedule,
} = require('../controller/appointments');

const router = Router();

router.get('/appointments', listAppointments);
router.get('/appointments/:id', getAppointmentById);
router.post('/appointments', createAppointment);
router.put('/appointments/:id', update); // Manter 'update' se for usado em outro lugar, ou renomear.
router.delete('/appointments/:id', deleteAppointment);
router.patch('/appointments/:id/status', updateStatus);
router.patch('/appointments/:id/reschedule', reschedule);

module.exports = router;
