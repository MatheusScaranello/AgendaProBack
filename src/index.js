import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Carrega as variáveis de ambiente do arquivo .env
dotenv.config();

// Importação das rotas
import establishmentsRoutes from './routes/establishmentsRoutes.js';
import professionalsRoutes from './routes/professionalsRoutes.js';
import clientsRoutes from './routes/clientsRoutes.js';
import servicesRoutes from './routes/servicesRoutes.js';
import productsRoutes from './routes/productsRoutes.js';
import appointmentsRoutes from './routes/appointmentsRoutes.js';
import salesRoutes from './routes/salesRoutes.js';
import saleItemsRoutes from './routes/sale_itemsRoutes.js';
import productBatchesRoutes from './routes/product_batchesRoutes.js';
import commissionsRoutes from './routes/commissionsRoutes.js';
import absencesRoutes from './routes/absencesRoutes.js';
import cashFlowRoutes from './routes/cash_flowRoutes.js';
import assetsRoutes from './routes/assetsRoutes.js';
import mercadoPagoRoutes from './routes/mercadoPagoRoutes.js';

const app = express();
const PORT = process.env.PORT || 3001;

// --- Middlewares Essenciais ---

// 1. Configuração do CORS
const allowedOrigins = [
  'http://localhost:3000',
  'https://oiagendapro.vercel.app' // URL de produção do seu frontend
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'], // Adicionado PATCH
  credentials: true
}));

// 2. Middleware para processar JSON no corpo das requisições
app.use(express.json());


// --- Definição das Rotas com Prefixos ---
// CORREÇÃO: Adicionados prefixos para corresponder às chamadas do frontend.
app.use('/establishments', establishmentsRoutes);
app.use('/professionals', professionalsRoutes);
app.use('/clients', clientsRoutes);
app.use('/services', servicesRoutes);
app.use('/products', productsRoutes);
app.use('/appointments', appointmentsRoutes);
app.use('/sales', salesRoutes);
app.use('/sale-items', saleItemsRoutes);
app.use('/product-batches', productBatchesRoutes);
app.use('/commissions', commissionsRoutes);
app.use('/absences', absencesRoutes);
app.use('/cash-flow', cashFlowRoutes);
app.use('/assets', assetsRoutes);
app.use('/payments', mercadoPagoRoutes); // Usando um prefixo genérico para pagamentos


// --- Rota Raiz para Verificação de Status ---
app.get('/', (req, res) => {
  res.status(200).send('API do AgendaPro está funcionando!');
});


// --- Inicialização do Servidor ---
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

// Exporta o app para ser usado em outros contextos (ex: testes ou Vercel)
export default app;
