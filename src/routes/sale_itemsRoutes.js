// Em src/routes/salesRoutes.js
const saleItemsRouter = require('./sale_itemsRoutes');
// ...
// Aninha as rotas de itens sob a rota de uma venda específica
router.use('/:sale_id/items', saleItemsRouter);


// Em src/index.js
const saleItemsRoutes = require('./src/routes/sale_itemsRoutes');
// ...
// Adiciona a rota para buscar um item pelo seu ID
app.use('/api/sale-items', saleItemsRoutes);