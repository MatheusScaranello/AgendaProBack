// src/index.js

require('dotenv').config();
const express = require('express');
const cors = require('cors');

// --- Importação de Todas as Rotas ---
const establishmentsRoutes = require('./routes/establishmentsRoutes');
const professionalsRoutes = require('./routes/professionalsRoutes');
const servicesRoutes = require('./routes/servicesRoutes');
const clientsRoutes = require('./routes/clientsRoutes');
const assetsRoutes = require('./routes/assetsRoutes');
const appointmentsRoutes = require('./routes/appointmentsRoutes');
const salesRoutes = require('./routes/salesRoutes');
const saleItemsRoutes = require('./routes/sale_itemsRoutes');
const commissionsRoutes = require('./routes/commissionsRoutes');
const cashFlowRoutes = require('./routes/cash_flowRoutes');
const productsRoutes = require('./routes/productsRoutes');
const productBatchesRoutes = require('./routes/product_batchesRoutes');
const absencesRoutes = require('./routes/absencesRoutes');
const mercadopago = require('./routes/mercadoPagoRoutes');


const app = express();
const PORT = process.env.PORT || 3333;

// --- Middlewares Essenciais ---
app.use(cors()); // Permite requisições de outras origens (ex: seu frontend)
app.use(express.json()); // Habilita o servidor a entender JSON no corpo das requisições

// Middleware de Log (Opcional, mas útil para depuração)
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});


// --- Definição das Rotas da API ---
app.get('/api', (req, res) => res.json({ message: 'API AgendaPro está no ar!' }));

// Módulos Principais
app.use('/api/establishments', establishmentsRoutes);
app.use('/api/professionals', professionalsRoutes);
app.use('/api/services', servicesRoutes);
app.use('/api/clients', clientsRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/appointments', appointmentsRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/assets', assetsRoutes);

// Módulos Secundários e de Suporte
app.use('/api/commissions', commissionsRoutes);
app.use('/api/cash-flow', cashFlowRoutes);

// Rotas para entidades aninhadas que podem ser acessadas diretamente pelo seu ID
app.use('/api/absences', absencesRoutes);
app.use('/api/product-batches', productBatchesRoutes);
app.use('/api/sale-items', saleItemsRoutes);


// --- Middleware de Tratamento de Erros (Deve ser o último) ---
app.use((err, req, res, next) => {
    console.error('Ocorreu um erro:', err.stack);
    res.status(500).json({ 
        message: 'Ocorreu um erro interno no servidor.',
        error: err.message,
    });
});

// Rotas do Mercado Pago
app.use('/api/payments', mercadopago);

// Middleware de erro (se houver)
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Erro interno do servidor');
});


// --- Inicialização do Servidor ---
app.listen(PORT, () => {
    console.log(`🚀 Servidor supremo rodando na porta ${PORT}`);
});