
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/dbConfig');

const router = express.Router();

// CADASTRO DE ESTABELECIMENTO
async function cadastrar(req, res) {
  try {
    const { name, trade_name, email, phone, password } = req.body;

    if (!name?.trim() || !email?.trim() || !password) {
      return res.status(400).json({
        message: 'Nome, e-mail e senha são obrigatórios.'
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: 'A senha deve ter pelo menos 8 caracteres.'
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const result = await db.query(
      `INSERT INTO establishments
       (name, trade_name, email, phone, plan, password_hash)
       VALUES ($1, $2, $3, $4, 'teste', $5)
       RETURNING id, name, trade_name, email, phone, plan`,
      [
        name.trim(),
        trade_name?.trim() || null,
        email.trim().toLowerCase(),
        phone?.trim() || null,
        passwordHash
      ]
    );

    return res.status(201).json({
      message: 'Estabelecimento cadastrado com sucesso!',
      establishment: result.rows[0]
    });

  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({
        message: 'Este e-mail já está cadastrado.'
      });
    }

    console.error('Erro no cadastro:', error.message);
    return res.status(500).json({
      message: 'Erro interno ao cadastrar.'
    });
  }
}

// LOGIN DE ESTABELECIMENTO
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email?.trim() || !password) {
      return res.status(400).json({
        message: 'Informe e-mail e senha.'
      });
    }

    const result = await db.query(
      'SELECT * FROM establishments WHERE email = $1',
      [email.trim().toLowerCase()]
    );

    const establishment = result.rows[0];

    if (!establishment ||
        !(await bcrypt.compare(password, establishment.password_hash))) {
      return res.status(401).json({
        message: 'E-mail ou senha inválidos.'
      });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        message: 'JWT_SECRET não configurado.'
      });
    }

    const token = jwt.sign(
      { establishmentId: establishment.id },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    const { password_hash, ...safeEstablishment } = establishment;

    return res.status(200).json({
      token,
      establishment: safeEstablishment
    });

  } catch (error) {
    console.error('Erro no login:', error.message);
    return res.status(500).json({
      message: 'Erro interno ao realizar login.'
    });
  }
});

// ROTAS DE CADASTRO
router.post('/', cadastrar);
router.post('/register', cadastrar);

module.exports = router;
