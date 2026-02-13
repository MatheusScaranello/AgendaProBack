require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Importa os routers
const professionalsRouter = require('./routes/professionalsRoutes');
const servicesRouter = require('./routes/servicesRoutes');
const absencesRouter = require('./routes/absencesRoutes');

// Usa os routers
app.use('/api', professionalsRouter);
app.use('/api', servicesRouter);
app.use('/api/professionals/:professional_id/absences', absencesRouter);


module.exports = app;
