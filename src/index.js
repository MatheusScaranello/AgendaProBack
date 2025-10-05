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
const establishmentsRoutes = require('./routes/establishmentsRoutes');
const professionalsRoutes = require('./routes/professionalsRoutes');
const clientsRoutes = require('./routes/clientsRoutes');
const servicesRoutes = require('./routes/servicesRoutes');
const appointmentsRoutes = require('./routes/appointmentsRoutes');
const productsRoutes = require('./routes/productsRoutes');
const salesRoutes = require('./routes/salesRoutes');
const saleItemsRoutes = require('./routes/sale_itemsRoutes');
const productBatchesRoutes = require('./routes/product_batchesRoutes');
const assetsRoutes = require('./routes/assetsRoutes');
const absencesRoutes = require('./routes/absencesRoutes');
const cashFlowRoutes = require('./routes/cash_flowRoutes');
const commissionsRoutes = require('./routes/commissionsRoutes');
const mercadoPagoRoutes = require('./routes/mercadoPagoRoutes');


app.use('/api', establishmentsRoutes);
app.use('/api', professionalsRoutes);
app.use('/api', clientsRoutes);
app.use('/api', servicesRoutes);
app.use('/api', appointmentsRoutes);
app.use('/api', productsRoutes);
app.use('/api', salesRoutes);
app.use('/api', saleItemsRoutes);
app.use('/api', productBatchesRoutes);
app.use('/api', assetsRoutes);
app.use('/api', absencesRoutes);
app.use('/api', cashFlowRoutes);
app.use('/api', commissionsRoutes);
app.use('/api', mercadoPagoRoutes);


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
