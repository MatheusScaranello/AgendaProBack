const { MercadoPagoConfig, Preference, Payment } = require('mercadopago');
const db = require('../config/dbConfig');

const client = new MercadoPagoConfig({ accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN });
const preference = new Preference(client);
const payment = new Payment(client);

/**
 * Cria uma preferência de pagamento (checkout).
 */
const createCheckout = async (req, res, next) => {
    const { items, sale_id } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ message: 'A lista de itens é obrigatória.' });
    }

    if (!sale_id) {
        return res.status(400).json({ message: 'O sale_id é obrigatório para identificar a venda.' });
    }

    try {
        const body = {
            items: items.map(item => ({
                id: item.id,
                title: item.title,
                quantity: Number(item.quantity),
                unit_price: Number(item.unit_price),
                currency_id: 'BRL',
            })),
            back_urls: {
                success: `${req.protocol}://${req.get('host')}/api/payments/success`,
                failure: `${req.protocol}://${req.get('host')}/api/payments/failure`,
                pending: `${req.protocol}://${req.get('host')}/api/payments/pending`,
            },
            auto_return: 'approved',
            external_reference: sale_id,
            notification_url: `${req.protocol}://${req.get('host')}/api/payments/webhook`,
        };

        const result = await preference.create({ body });

        res.status(201).json({
            preferenceId: result.id,
            init_point: result.init_point,
            sandbox_init_point: result.sandbox_init_point, // útil para testes
        });

    } catch (error) {
        console.error('Erro ao criar preferência no Mercado Pago:', error.message);
        return res.status(500).json({ message: 'Erro ao criar preferência de pagamento.' });
    }
};

/**
 * Recebe notificações do Mercado Pago (webhook).
 */
const receiveWebhook = async (req, res) => {
    const { type, data } = req.query;

    if (type === 'payment' && data?.id) {
        try {
            console.log(`🔔 Webhook recebido - pagamento ID: ${data.id}`);

            const paymentInfo = await payment.get({ id: data.id });
            const info = paymentInfo.body; // acessa os dados no body

            const sale_id = info.external_reference;
            const status = info.status;

            let newStatus = 'Pendente';
            if (status === 'approved') {
                newStatus = 'Pago';
            } else if (status === 'rejected' || status === 'cancelled') {
                newStatus = 'Falhou';
            }

            if (sale_id) {
                await db.query('UPDATE sales SET status = $1 WHERE id = $2', [newStatus, sale_id]);
                console.log(`✅ Status da venda ${sale_id} atualizado para ${newStatus}`);
            } else {
                console.warn('⚠️ Nenhum sale_id encontrado na transação.');
            }

            res.status(200).send('Webhook recebido com sucesso.');
        } catch (error) {
            console.error('Erro ao processar webhook do Mercado Pago:', error.message);
            return res.status(500).send('Erro no servidor ao processar webhook.');
        }
    } else {
        console.log('📩 Notificação recebida mas não é de pagamento.');
        res.status(200).send('Notificação recebida.');
    }
};

module.exports = {
    createCheckout,
    receiveWebhook,
};
