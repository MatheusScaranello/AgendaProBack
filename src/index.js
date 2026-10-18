
require('dotenv').config();

console.log('JWT carregado:', Boolean(process.env.JWT_SECRET));

const express = require('express');
const cors = require('cors');
const db = require('./config/dbConfig');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Rota principal
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'AgendaPro API funcionando',
    status: 'online'
  });
});

// Teste da API e do PostgreSQL
app.get('/api/health', async (req, res) => {
  try {
    await db.query('SELECT 1');

    return res.status(200).json({
      status: 'ok',
      database: 'connected',
      message: 'AgendaPro API funcionando'
    });
  } catch (error) {
    console.error('Erro PostgreSQL:', error.message);

    return res.status(503).json({
      status: 'error',
      database: 'disconnected',
      message: 'Falha na conexão com PostgreSQL'
    });
  }
});

// Importação das rotas
const professionalsRouter = require('./routes/professionalsRoutes');
const servicesRouter = require('./routes/servicesRoutes');
const absencesRouter = require('./routes/absencesRoutes');
const salesRouter = require('./routes/salesRoutes');
const clientsRouter = require('./routes/clientsRoutes');
const appointmentsRouter = require('./routes/appointmentsRoutes');
const establishmentsRouter = require('./routes/establishmentsRoutes');

// Registro das rotas
app.use('/api', professionalsRouter);
app.use('/api', servicesRouter);
app.use(
  '/api/professionals/:professional_id/absences',
  absencesRouter
);
app.use('/api', salesRouter);
app.use('/api', clientsRouter);
app.use('/api', appointmentsRouter);
app.use('/api/establishments', establishmentsRouter);

// Tratamento de rotas inexistentes
app.use((req, res) => {
  res.status(404).json({
    error: 'Rota não encontrada'
  });
});

// Tratamento de erros
app.use((err, req, res, next) => {
  console.error('Erro interno:', err);

  res.status(500).json({
    error: 'Erro interno do servidor'
  });
});

// Inicialização local
if (require.main === module) {
  const PORT = process.env.PORT || 3001;

  app.listen(PORT, () => {
    console.log(`AgendaPro rodando na porta ${PORT}`);
  });
}

// Exportação para Vercel
module.exports = app;
