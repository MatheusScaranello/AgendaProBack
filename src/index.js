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
// Permite que o frontend (rodando em localhost ou no Vercel) acesse a API.
const allowedOrigins = [
  'http://localhost:3000',
  'https://oiagendapro.vercel.app' // Adicione a URL de produção do seu frontend
];

app.use(cors({
  origin: function (origin, callback) {
    // Permite requisições sem 'origin' (ex: Postman, apps mobile) ou da lista de origens permitidas
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true
}));

// 2. Middleware para processar JSON no corpo das requisições
app.use(express.json());


// --- Definição das Rotas ---
// O prefixo '/api' já está definido dentro de cada arquivo de rota,
// então não é necessário colocá-lo aqui novamente.
app.use(establishmentsRoutes);
app.use(professionalsRoutes);
app.use(clientsRoutes);
app.use(servicesRoutes);
app.use(productsRoutes);
app.use(appointmentsRoutes);
app.use(salesRoutes);
app.use(saleItemsRoutes);
app.use(productBatchesRoutes);
app.use(commissionsRoutes);
app.use(absencesRoutes);
app.use(cashFlowRoutes);
app.use(assetsRoutes);
app.use(mercadoPagoRoutes);


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
