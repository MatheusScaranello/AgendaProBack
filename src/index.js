// Carrega as variáveis de ambiente do arquivo .env
require('dotenv').config();

const express = require('express');
const cors = require('cors');

// Importação das rotas
const establishmentsRoutes = require('./routes/establishmentsRoutes.js');
const professionalsRoutes = require('./routes/professionalsRoutes.js');
const clientsRoutes = require('./routes/clientsRoutes.js');
const servicesRoutes = require('./routes/servicesRoutes.js');
const productsRoutes = require('./routes/productsRoutes.js');
const appointmentsRoutes = require('./routes/appointmentsRoutes.js');
const salesRoutes = require('./routes/salesRoutes.js');
const saleItemsRoutes = require('./routes/sale_itemsRoutes.js');
const productBatchesRoutes = require('./routes/product_batchesRoutes.js');
const commissionsRoutes = require('./routes/commissionsRoutes.js');
const absencesRoutes = require('./routes/absencesRoutes.js');
const cashFlowRoutes = require('./routes/cash_flowRoutes.js');
const assetsRoutes = require('./routes/assetsRoutes.js');
const mercadoPagoRoutes = require('./routes/mercadoPagoRoutes.js');

const app = express();
const PORT = process.env.PORT || 3001;

// --- Middlewares Essenciais ---

// 1. Configuração do CORS (permitindo todas as origens para garantir que funcione)
app.use(cors({
    origin: '*', // Permite qualquer origem
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    credentials: true
}));


// 2. Middleware para processar JSON no corpo das requisições
app.use(express.json());


// --- Definição das Rotas com Prefixos ---
// Usando um prefixo "/api" para todas as rotas para corresponder às chamadas do frontend
app.use('/api/establishments', establishmentsRoutes);
app.use('/api/professionals', professionalsRoutes);
app.use('/api/clients', clientsRoutes);
app.use('/api/services', servicesRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/appointments', appointmentsRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/sale-items', saleItemsRoutes);
app.use('/api/product-batches', productBatchesRoutes);
app.use('/api/commissions', commissionsRoutes);
app.use('/api/absences', absencesRoutes);
app.use('/api/cash-flow', cashFlowRoutes);
app.use('/api/assets', assetsRoutes);
app.use('/api/payments', mercadoPagoRoutes);


// --- Rota Raiz para Verificação de Status ---
app.get('/', (req, res) => {
  res.status(200).send('API do AgendaPro está funcionando!');
});


// --- Inicialização do Servidor ---
// A Vercel gerencia a porta, então o app.listen é mais para desenvolvimento local.
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Servidor rodando na porta ${PORT}`);
    });
}

// Exporta o app para a Vercel
module.exports = app;
