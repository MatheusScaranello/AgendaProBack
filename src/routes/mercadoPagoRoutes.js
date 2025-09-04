const { Router } = require('express');
const { createCheckout, receiveWebhook } = require('../controller/mercadoPagoController');

const router = Router();

// Rota para criar a preferência de pagamento
router.post('/create-checkout', createCheckout);

// Rota para receber notificações do webhook
router.post('/webhook', async (req, res) => {
    try {
        await receiveWebhook(req, res);
        res.sendStatus(200); // Confirma recebimento ao Mercado Pago
    } catch (err) {
        console.error('Erro no webhook:', err);
        res.sendStatus(500);
    }
});

// Rotas de retorno para o cliente
router.get('/success', (req, res) => {
    res.send('Pagamento aprovado com sucesso!'); 
});

router.get('/failure', (req, res) => {
    res.send('O pagamento falhou.');
});

router.get('/pending', (req, res) => {
    res.send('O pagamento está pendente.');
});

module.exports = router;

