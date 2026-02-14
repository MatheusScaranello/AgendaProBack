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
const salesRouter = require('./routes/salesRoutes');
const clientsRouter = require('./routes/clientsRoutes');
const appointmentsRouter = require('./routes/appointmentsRoutes');

// Usa os routers
app.use('/api', professionalsRouter);
app.use('/api', servicesRouter);
app.use('/api/professionals/:professional_id/absences', absencesRouter);
app.use('/api', salesRouter);
app.use('/api', clientsRouter);
app.use('/api', appointmentsRouter);

// Inicia o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});

// servidor funcionando

app.get('/', (req, res) => {
    res.send('Bem-vindo à API de Agendamento!');
});

module.exports = app;
