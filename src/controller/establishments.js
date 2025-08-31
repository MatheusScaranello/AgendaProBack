const db = require('../config/dbConfig');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt'); // 1. Importe o bcrypt
const jwt = require('jsonwebtoken');

/**
 * Cria um novo estabelecimento com senha criptografada.
 */
const createEstablishment = async (req, res, next) => {
    // 2. Receba a senha do corpo da requisição
    const { name, trade_name, phone, email, address, plan, password } = req.body;
    const newId = uuidv4();

    if (!password) {
        return res.status(400).json({ message: 'A senha é obrigatória.' });
    }

    try {
        // 3. Crie o hash da senha
        const saltRounds = 10; // Fator de custo da criptografia
        const password_hash = await bcrypt.hash(password, saltRounds);

        // 4. Salve o password_hash no banco
        const query = `
            INSERT INTO establishments (id, name, trade_name, phone, email, address, plan, password_hash)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING id, name, email, plan; -- Não retorne o hash da senha
        `;
        const values = [newId, name, trade_name, phone, email, address, plan, password_hash];
        const result = await db.query(query, values);

        res.status(201).json(result.rows[0]);
    } catch (error) {
        if (error.code === '23505' && error.constraint === 'establishments_email_key') {
            return res.status(409).json({ message: 'O e-mail informado já está em uso.' });
        }
        next(error);
    }
};

/**
 * Lista todos os estabelecimentos.
 */
const listEstablishments = async (req, res, next) => {
    try {
        const result = await db.query('SELECT * FROM establishments ORDER BY name ASC');
        res.status(200).json(result.rows);
    } catch (error) {
        next(error);
    }
};

// obter por e-mail
const getEstablishmentByEmail = async (req, res, next) => {
    const { email } = req.params; // Pega o e-mail da URL
    try {
        const result = await db.query('SELECT id, name, email FROM establishments WHERE email = $1', [email]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Estabelecimento com este e-mail não encontrado.' });
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {
        next(error);
    }
};

/**
 * Obtém um estabelecimento específico pelo seu ID.
 */
const getEstablishmentById = async (req, res, next) => {
    const { id } = req.params;
    try {
        const result = await db.query('SELECT * FROM establishments WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Estabelecimento não encontrado.' });
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {
        next(error);
    }
};

/**
 * Atualiza os dados de um estabelecimento.
 */
const updateEstablishment = async (req, res, next) => {
    const { id } = req.params;
    const { name, trade_name, phone, email, address, plan } = req.body;
    try {
        const query = `
            UPDATE establishments
            SET name = $1, trade_name = $2, phone = $3, email = $4, address = $5, plan = $6, updated_at = NOW()
            WHERE id = $7
            RETURNING *;
        `;
        const values = [name, trade_name, phone, email, address, plan, id];
        const result = await db.query(query, values);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Estabelecimento não encontrado.' });
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {
        if (error.code === '23505' && error.constraint === 'establishments_email_key') {
            return res.status(409).json({ message: 'O e-mail informado já está em uso por outro estabelecimento.' });
        }
        next(error);
    }
};

/**
 * Deleta um estabelecimento.
 */
const deleteEstablishment = async (req, res, next) => {
    const { id } = req.params;
    try {
        const result = await db.query('DELETE FROM establishments WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Estabelecimento não encontrado.' });
        }
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};

/**
 * Autentica um estabelecimento e retorna um token JWT.
 */
const loginEstablishment = async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'E-mail and password are required.' });
    }

    try {
        // 1. Encontra o estabelecimento pelo e-mail
        const result = await db.query('SELECT * FROM establishments WHERE email = $1', [email]);
        if (result.rows.length === 0) {
            return res.status(401).json({ message: 'E-mail ou senha incorretos.' });
        }
        const establishment = result.rows[0];

        // 2. Compara a senha enviada com o hash salvo no banco
        const isPasswordValid = await bcrypt.compare(password, establishment.password_hash);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'E-mail ou senha incorretos.' });
        }

        // 3. Se a senha for válida, cria um token JWT
        const token = jwt.sign(
            { id: establishment.id, email: establishment.email },
            process.env.JWT_SECRET,
            { expiresIn: '8h' } // Token expira em 8 horas
        );

        // 4. Envia o token e dados básicos do usuário (sem a senha)
        res.status(200).json({
            message: 'Login bem-sucedido!',
            token,
            establishment: {
                id: establishment.id,
                name: establishment.name,
                email: establishment.email
            }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createEstablishment,
    listEstablishments,
    getEstablishmentById,
    updateEstablishment,
    deleteEstablishment,
    getEstablishmentByEmail,
    loginEstablishment
};