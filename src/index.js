require('dotenv').config();
const express = require('express');
const cors = require('cors');
const AppError = require('./utils/AppError');

// Importação de todas as suas rotas
const establishmentsRoutes = require('./routes/establishmentsRoutes');
const professionalsRoutes = require('./routes/professionalsRoutes');
const clientsRoutes = require('./routes/clientsRoutes');
const servicesRoutes = require('./routes/servicesRoutes');
const productsRoutes = require('./routes/productsRoutes');
const appointmentsRoutes = require('./routes/appointmentsRoutes');
const salesRoutes = require('./routes/salesRoutes');
const saleItemsRoutes = require('./routes/sale_itemsRoutes');
const commissionsRoutes = require('./routes/commissionsRoutes');
const cashFlowRoutes = require('./routes/cash_flowRoutes');
const assetsRoutes = require('./routes/assetsRoutes');
const absencesRoutes = require('./routes/absencesRoutes');
const productBatchesRoutes = require('./routes/product_batchesRoutes');
const mercadoPagoRoutes = require('./routes/mercadoPagoRoutes');


const app = express();

// --- Middlewares ---

// 1. Configuração de CORS (Cross-Origin Resource Sharing)
// Permite que seu frontend, em uma URL diferente, faça requisições para este backend.
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000', // Use a URL do seu frontend da Vercel aqui
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
  optionsSuccessStatus: 204
};
app.use(cors(corsOptions));

// 2. Middleware para processar JSON
// Permite que o Express entenda requisições com corpo no formato JSON.
app.use(express.json());


// --- Rotas da API ---
// Todas as rotas são prefixadas com /api para uma melhor organização.
app.use('/api/establishments', establishmentsRoutes);
app.use('/api/professionals', professionalsRoutes);
app.use('/api/clients', clientsRoutes);
app.use('/api/services', servicesRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/appointments', appointmentsRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/sale-items', saleItemsRoutes);
app.use('/api/commissions', commissionsRoutes);
app.use('/api/cash-flow', cashFlowRoutes);
app.use('/api/assets', assetsRoutes);
app.use('/api/absences', absencesRoutes);
app.use('/api/product-batches', productBatchesRoutes);
app.use('/api/mercado-pago', mercadoPagoRoutes);


// --- Tratamento de Erros Centralizado ---
// Este middleware captura todos os erros que ocorrem nas rotas.
app.use((err, request, response, next) => {
  // Se o erro for uma instância de AppError, é um erro conhecido da aplicação.
  if (err instanceof AppError) {
    return response.status(err.statusCode).json({
      status: 'error',
      message: err.message
    });
  }

  // Para erros não esperados (erros de programação, falhas de pacotes, etc.).
  console.error(err); // Loga o erro no console do servidor para depuração.

  return response.status(500).json({
    status: 'error',
    message: 'Erro interno do servidor'
  });
});


// --- Inicialização do Servidor ---
const PORT = process.env.PORT || 3333;
app.listen(PORT, () => console.log(`O servidor está rodando na porta ${PORT}`));

// Exporta o app para ser utilizado pela Vercel
module.exports = app;
