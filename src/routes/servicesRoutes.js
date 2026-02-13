// src/routes/servicesRoutes.js

const { Router } = require('express');
const {
    createService,
    listServices,
    getServiceById,
    updateService,
    deleteService
} = require('../controller/services');

const router = Router();

router.post('/services', createService);
router.get('/services', listServices);
router.get('/services/:id', getServiceById);
router.put('/services/:id', updateService);
router.delete('/services/:id', deleteService);

module.exports = router;