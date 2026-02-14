// src/routes/appointmentsRoutes.js

const {
    Router
} = require('express');
const {
    createAppointment,
    listAppointments,
    updateAppointment,
    deleteAppointment,
    getAppointmentById
} = require('../controller/appointments');

const router = Router();

router.post('/appointments', createAppointment);
router.get('/appointments', listAppointments);
router.get('/appointments/:id', getAppointmentById);
router.put('/appointments/:id', updateAppointment);
router.delete('/appointments/:id', deleteAppointment);

module.exports = router;
