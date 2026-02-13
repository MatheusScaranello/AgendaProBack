require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

// 1. Configuração do CORS (MAIS PERMISSIVA PARA DEBUG)
// ATENÇÃO: Esta configuração é para fins de teste e não é segura para produção.
app.use(cors({
    origin: (origin, callback) => {
        // Permite todas as origens para teste
        callback(null, true);
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    credentials: true
}));

// 2. Middlewares
app.use(express.json());

// 3. Rotas
const professionalsRoutes = require('./routes/professionalsRoutes');
const clientsRoutes = require('./routes/clientsRoutes');
const servicesRoutes = require('./routes/servicesRoutes');
const appointmentsRoutes = require('./routes/appointmentsRoutes');
const salesRoutes = require('./routes/salesRoutes');
const absencesRoutes = require('./routes/absencesRoutes');


app.use('/api', professionalsRoutes);
app.use('/api', clientsRoutes);
app.use('/api', servicesRoutes);
app.use('/api', appointmentsRoutes);
app.use('/api', salesRoutes);
app.use('/api', absencesRoutes);


// 4. Tratamento de Erros (opcional, mas recomendado)
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Algo deu errado!');
});

// 5. Iniciar o Servidor
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});

module.exports = app;
