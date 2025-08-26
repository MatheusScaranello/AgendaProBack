// Importação do módulo dotenv para carregar variáveis de ambiente
require("dotenv").config();
const express = require("express");
const cors = require('cors');
// Importação dos arquivos de rota
const estabelecimentosRoutes = require("./routes/EstabelecimentosRoutes");
const clientesRoutes = require("./routes/ClientesRoutes");
const agendamentosRoutes = require("./routes/AgendamentosRoutes");
const profissionaisRoutes = require("./routes/ProfissionaisRoutes");

// Criação de uma instância do aplicativo Express
const app = express();

const port = process.env.PORT || 4000;
app.use(cors());
// Middleware para processar corpos de requisição no formato JSON
app.use(express.json());

// Roteamento para os endpoints relacionados a estabelecimentos
app.use("/estabelecimentos", estabelecimentosRoutes);
app.use("/clientes", clientesRoutes);
app.use("/agendamentos", agendamentosRoutes);
app.use("/profissionais", profissionaisRoutes);

// Rota para a raiz do servidor
app.get("/", (req, res) => {
  res.json({ message: "API funcionando!" });
}
);

// Inicialização do servidor, que escuta as requisições na porta especificada
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});