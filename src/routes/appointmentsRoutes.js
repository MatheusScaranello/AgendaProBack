// src/routes/appointmentsRoutes.js

const {
    Router
} = require('express');
const {
    createAppointment,
    listAppointments,
    updateAppointment,
    deleteAppointment
} = require('../controller/appointments');

const router = Router();

router.post('/appointments', createAppointment);
router.get('/appointments', listAppointments);
router.put('/appointments/:id', updateAppointment);
router.delete('/appointments/:id', deleteAppointment);

module.exports = router;
