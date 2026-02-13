require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

// 1. Configurações do Express
app.use(cors());
app.use(express.json());

// 2. Importar e Usar Rotas
const clientsRoutes = require('./routes/clientsRoutes');
const professionalsRoutes = require('./routes/professionalsRoutes');
const servicesRoutes = require('./routes/servicesRoutes');
const salesRoutes = require('./routes/salesRoutes');
const absencesRoutes = require('./routes/absencesRoutes');
const appointmentsRoutes = require('./routes/appointmentsRoutes');

// 3. Usar Rotas
app.use('/api', clientsRoutes);
app.use('/api', professionalsRoutes);
app.use('/api', servicesRoutes);
app.use('/api', salesRoutes);
app.use('/api', absencesRoutes);
app.use('/api', appointmentsRoutes);

// 4. Rota de Teste
app.get('/api/test', (req, res) => {
    res.json({ message: 'API funcionando!' });
});

// 5. Iniciar o Servidor
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});

module.exports = app;
