// Carrega as variáveis de ambiente do arquivo .env
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const AppError = require('./utils/AppError'); // Importa a classe de erro

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
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    credentials: true
}));
app.use(express.json());


// --- Definição das Rotas com Prefixos ---
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


// --- Middleware de Tratamento de Erros ATUALIZADO ---
app.use((err, req, res, next) => {
    // Se for um erro operacional conhecido, envia uma resposta amigável
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
        });
    }

    // Para erros não esperados (bugs), loga o erro e envia uma resposta genérica
    console.error('ERRO 💥', err);

    res.status(500).json({
        status: 'error',
        message: 'Ocorreu um erro interno no servidor.',
    });
});


// --- Inicialização do Servidor (apenas para desenvolvimento local) ---
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Servidor rodando na porta ${PORT}`);
    });
}

module.exports = app;
