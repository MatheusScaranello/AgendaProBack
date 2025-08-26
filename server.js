import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { pool } from "./db.js";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || "devsecret";

/* ---------- Helpers ---------- */
const auth = async (req, res, next) => {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) return res.status(401).json({ error: "Token ausente" });
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload; // { id, estabelecimento_id? }
    next();
  } catch (e) {
    res.status(401).json({ error: "Token inválido" });
  }
};

const onlyEstab = (req, res, next) => {
  if (!req.user?.estabelecimento_id) {
    return res.status(403).json({ error: "Acesso restrito a Estabelecimento" });
  }
  next();
};

/* ---------- Auth Estabelecimento ---------- */
// cadastro
app.post("/auth/signup", async (req, res) => {
  try {
    const { nome, email, telefone, plano, senha } = req.body;
    if (!nome || !email || !senha) {
      return res.status(400).json({ error: "nome, email e senha são obrigatórios" });
    }
    const hash = await bcrypt.hash(senha, 10);
    const q = `INSERT INTO Estabelecimento (nome, email, telefone, plano, senha)
               VALUES ($1,$2,$3,$4,$5) RETURNING id, nome, email`;
    const { rows } = await pool.query(q, [nome, email, telefone || null, plano || null, hash]);
    const token = jwt.sign({ estabelecimento_id: rows[0].id }, JWT_SECRET, { expiresIn: "7d" });
    res.status(201).json({ token, estabelecimento: rows[0] });
  } catch (e) {
    if (e.code === "23505") return res.status(409).json({ error: "email já cadastrado" });
    console.error(e);
    res.status(500).json({ error: "erro ao cadastrar" });
  }
});

// login
app.post("/auth/login", async (req, res) => {
  try {
    const { email, senha } = req.body;
    const { rows } = await pool.query("SELECT * FROM Estabelecimento WHERE email=$1", [email]);
    const estab = rows[0];
    if (!estab) return res.status(401).json({ error: "credenciais inválidas" });
    const ok = await bcrypt.compare(senha, estab.senha);
    if (!ok) return res.status(401).json({ error: "credenciais inválidas" });
    const token = jwt.sign({ estabelecimento_id: estab.id }, JWT_SECRET, { expiresIn: "7d" });
    res.json({ token, estabelecimento: { id: estab.id, nome: estab.nome, email: estab.email } });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "erro ao logar" });
  }
});

/* ---------- CRUD Clientes ---------- */
app.get("/clientes", auth, onlyEstab, async (req, res) => {
  const { estabelecimento_id } = req.user;
  const { rows } = await pool.query("SELECT * FROM Clientes WHERE estabelecimento_id=$1 ORDER BY id DESC", [estabelecimento_id]);
  res.json(rows);
});

app.post("/clientes", auth, onlyEstab, async (req, res) => {
  const { nome, telefone, email, observacoes } = req.body;
  const { estabelecimento_id } = req.user;
  const q = `INSERT INTO Clientes (nome, telefone, email, observacoes, estabelecimento_id)
            VALUES ($1,$2,$3,$4,$5) RETURNING *`;
  const { rows } = await pool.query(q, [nome, telefone || null, email || null, observacoes || null, estabelecimento_id]);
  res.status(201).json(rows[0]);
});

app.put("/clientes/:id", auth, onlyEstab, async (req, res) => {
  const { id } = req.params;
  const { nome, telefone, email, observacoes, frequencia } = req.body;
  const { estabelecimento_id } = req.user;
  const q = `UPDATE Clientes SET nome=$1, telefone=$2, email=$3, observacoes=$4, frequencia=$5
             WHERE id=$6 AND estabelecimento_id=$7 RETURNING *`;
  const { rows } = await pool.query(q, [nome, telefone, email, observacoes, frequencia ?? 0, id, estabelecimento_id]);
  if (!rows[0]) return res.status(404).json({ error: "cliente não encontrado" });
  res.json(rows[0]);
});

app.delete("/clientes/:id", auth, onlyEstab, async (req, res) => {
  const { id } = req.params;
  const { estabelecimento_id } = req.user;
  const q = "DELETE FROM Clientes WHERE id=$1 AND estabelecimento_id=$2 RETURNING id";
  const { rows } = await pool.query(q, [id, estabelecimento_id]);
  if (!rows[0]) return res.status(404).json({ error: "cliente não encontrado" });
  res.json({ ok: true });
});

/* ---------- CRUD Profissionais ---------- */
app.get("/profissionais", auth, onlyEstab, async (req, res) => {
  const { estabelecimento_id } = req.user;
  const { rows } = await pool.query("SELECT * FROM Profissionais WHERE estabelecimento_id=$1 ORDER BY id DESC", [estabelecimento_id]);
  res.json(rows);
});

app.post("/profissionais", auth, onlyEstab, async (req, res) => {
  const { nome } = req.body;
  const { estabelecimento_id } = req.user;
  const { rows } = await pool.query(
    "INSERT INTO Profissionais (nome, estabelecimento_id) VALUES ($1,$2) RETURNING *",
    [nome, estabelecimento_id]
  );
  res.status(201).json(rows[0]);
});

/* ---------- Agendamentos ---------- */
app.get("/agendamentos", auth, onlyEstab, async (req, res) => {
  const { estabelecimento_id } = req.user;
  const { de, ate, profissional_id } = req.query;
  let q = `SELECT a.*, c.nome AS cliente_nome, p.nome AS profissional_nome
           FROM Agendamentos a
           JOIN Clientes c ON c.id=a.cliente_id
           JOIN Profissionais p ON p.id=a.profissional_id
           WHERE a.estabelecimento_id=$1`;
  const params = [estabelecimento_id];
  if (de) { params.push(de); q += ` AND a.data_hora_inicio >= $${params.length}`; }
  if (ate){ params.push(ate); q += ` AND a.data_hora_fim    <= $${params.length}`; }
  if (profissional_id){ params.push(profissional_id); q += ` AND a.profissional_id = $${params.length}`; }
  q += " ORDER BY a.data_hora_inicio ASC";
  const { rows } = await pool.query(q, params);
  res.json(rows);
});

app.post("/agendamentos", auth, onlyEstab, async (req, res) => {
  const { cliente_id, profissional_id, data_hora_inicio, data_hora_fim, valor } = req.body;
  const { estabelecimento_id } = req.user;

  // Regra simples: impedir conflito (mesmo profissional no intervalo)
  const conflictQ = `
    SELECT 1 FROM Agendamentos
    WHERE profissional_id=$1 AND estabelecimento_id=$2
      AND tstzrange(data_hora_inicio, data_hora_fim, '[)') &&
          tstzrange($3::timestamp, $4::timestamp, '[)')
    LIMIT 1`;
  const conflict = await pool.query(conflictQ, [profissional_id, estabelecimento_id, data_hora_inicio, data_hora_fim]);
  if (conflict.rowCount) {
    return res.status(409).json({ error: "conflito de horário para este profissional" });
  }

  const q = `INSERT INTO Agendamentos
    (cliente_id, profissional_id, estabelecimento_id, data_hora_inicio, data_hora_fim, valor)
    VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`;
  const { rows } = await pool.query(q, [cliente_id, profissional_id, estabelecimento_id, data_hora_inicio, data_hora_fim, valor]);
  res.status(201).json(rows[0]);
});

app.patch("/agendamentos/:id/status", auth, onlyEstab, async (req, res) => {
  const { id } = req.params;
  const { status, pagamento_status } = req.body;
  const { estabelecimento_id } = req.user;
  const q = `UPDATE Agendamentos SET
               status = COALESCE($1, status),
               pagamento_status = COALESCE($2, pagamento_status)
             WHERE id=$3 AND estabelecimento_id=$4
             RETURNING *`;
  const { rows } = await pool.query(q, [status || null, pagamento_status || null, id, estabelecimento_id]);
  if (!rows[0]) return res.status(404).json({ error: "agendamento não encontrado" });
  res.json(rows[0]);
});

/* ---------- Pagamentos (stub para PIX/cartão/boleto) ---------- */
app.post("/pagamentos", auth, onlyEstab, async (req, res) => {
  const { agendamento_id, metodo, valor } = req.body;
  const q = `INSERT INTO Pagamentos (agendamento_id, metodo, valor, status, data_pagamento)
             VALUES ($1,$2,$3,'PENDENTE', NULL) RETURNING *`;
  const { rows } = await pool.query(q, [agendamento_id, metodo, valor]);
  // Aqui você integraria com o gateway (Gerencianet, Mercado Pago, Stripe, etc.)
  res.status(201).json(rows[0]);
});

app.post("/pagamentos/:id/capturar", auth, onlyEstab, async (req, res) => {
  const { id } = req.params;
  // Simula captura/confirmacao
  const { rows } = await pool.query(
    "UPDATE Pagamentos SET status='PAGO', data_pagamento=NOW() WHERE id=$1 RETURNING *",
    [id]
  );
  if (!rows[0]) return res.status(404).json({ error: "pagamento não encontrado" });

  // Atualiza o agendamento como pago/confirmado
  await pool.query(
    "UPDATE Agendamentos SET pagamento_status='PAGO', status='CONFIRMADO' WHERE id=$1",
    [rows[0].agendamento_id]
  );
  res.json(rows[0]);
});

/* ---------- Cancelamentos + política ---------- */
app.post("/cancelamentos", auth, onlyEstab, async (req, res) => {
  const { agendamento_id, motivo } = req.body;

  // Busca agendamento + política para calcular taxa
  const agQ = `SELECT a.*, e.id AS estab_id
               FROM Agendamentos a
               JOIN Estabelecimento e ON e.id=a.estabelecimento_id
               WHERE a.id=$1`;
  const { rows: agRows } = await pool.query(agQ, [agendamento_id]);
  const ag = agRows[0];
  if (!ag) return res.status(404).json({ error: "agendamento não encontrado" });

  const { rows: polRows } = await pool.query(
    "SELECT * FROM Politica_Cancelamento WHERE estabelecimento_id=$1 LIMIT 1",
    [ag.estabelecimento_id]
  );
  const pol = polRows[0];

  let taxa = 0;
  if (pol) {
    const horasAnteced = (new Date(ag.data_hora_inicio) - new Date()) / 36e5;
    if (horasAnteced < pol.horas_min_antecedencia) {
      taxa = pol.tipo === "PERCENTUAL" ? (Number(ag.valor) * Number(pol.taxa) / 100) : Number(pol.taxa);
    }
  }

  const { rows } = await pool.query(
    "INSERT INTO Cancelamentos (agendamento_id, motivo, taxa_cobrada) VALUES ($1,$2,$3) RETURNING *",
    [agendamento_id, motivo || null, taxa]
  );
  await pool.query("UPDATE Agendamentos SET status='CANCELADO' WHERE id=$1", [agendamento_id]);
  res.status(201).json({ cancelamento: rows[0], taxa });
});

/* ---------- Fila de espera ---------- */
app.post("/fila-espera", auth, onlyEstab, async (req, res) => {
  const { cliente_id, profissional_id, preferencia_horario } = req.body;
  const { estabelecimento_id } = req.user;
  const { rows } = await pool.query(
    `INSERT INTO Fila_Espera (cliente_id, estabelecimento_id, profissional_id, preferencia_horario)
     VALUES ($1,$2,$3,$4) RETURNING *`,
    [cliente_id, estabelecimento_id, profissional_id, preferencia_horario || null]
  );
  res.status(201).json(rows[0]);
});

app.post("/fila-espera/preencher", auth, onlyEstab, async (req, res) => {
  // Chamada quando um slot abre (por cancelamento, p.ex.)
  const { profissional_id, inicio, fim, valor } = req.body;
  const { estabelecimento_id } = req.user;

  const { rows: cand } = await pool.query(
    `SELECT * FROM Fila_Espera
     WHERE estabelecimento_id=$1 AND profissional_id=$2 AND status='ATIVO'
     ORDER BY data_solicitacao ASC LIMIT 1`,
    [estabelecimento_id, profissional_id]
  );
  if (!cand[0]) return res.json({ preenchido: false });

  // Cria agendamento para o primeiro da fila
  const { rows: ag } = await pool.query(
    `INSERT INTO Agendamentos
     (cliente_id, profissional_id, estabelecimento_id, data_hora_inicio, data_hora_fim, valor, status)
     VALUES ($1,$2,$3,$4,$5,$6,'PENDENTE') RETURNING *`,
    [cand[0].cliente_id, profissional_id, estabelecimento_id, inicio, fim, valor]
  );

  await pool.query("UPDATE Fila_Espera SET status='ATENDIDO' WHERE id=$1", [cand[0].id]);
  res.json({ preenchido: true, agendamento: ag[0] });
});

/* ---------- Mensagens (agendamento/envio de lembretes) ---------- */
app.post("/mensagens", auth, onlyEstab, async (req, res) => {
  const { cliente_id, agendamento_id, canal, mensagem } = req.body;
  const { rows } = await pool.query(
    `INSERT INTO Mensagens (cliente_id, agendamento_id, canal, mensagem)
     VALUES ($1,$2,$3,$4) RETURNING *`,
    [cliente_id, agendamento_id, canal, mensagem]
  );
  // Aqui você chamaria o provedor (WhatsApp API/Email/SMS) e então atualizaria o status
  res.status(201).json(rows[0]);
});

/* ---------- Anotações do cliente ---------- */
app.post("/clientes/:id/anotacoes", auth, onlyEstab, async (req, res) => {
  const { id } = req.params;
  const { profissional_id, descricao } = req.body;
  const { rows } = await pool.query(
    `INSERT INTO Anotacoes_Cliente (cliente_id, profissional_id, descricao)
     VALUES ($1,$2,$3) RETURNING *`,
    [id, profissional_id, descricao]
  );
  res.status(201).json(rows[0]);
});

/* ---------- Insights simples (query agregada) ---------- */
app.get("/insights/resumo", auth, onlyEstab, async (req, res) => {
  const { estabelecimento_id } = req.user;
  const q = `
    WITH base AS (
      SELECT
        DATE_TRUNC('month', data_hora_inicio) AS mesref,
        SUM(CASE WHEN status='CANCELADO' THEN valor ELSE 0 END) AS receita_perdida,
        SUM(CASE WHEN status='CONFIRMADO' OR status='CONCLUIDO' THEN valor ELSE 0 END) AS receita_confirmada
      FROM Agendamentos
      WHERE estabelecimento_id=$1
      GROUP BY 1
    )
    SELECT
      TO_CHAR(mesref, 'YYYY-MM') as periodo,
      receita_confirmada,
      receita_perdida
    FROM base
    ORDER BY mesref DESC
    LIMIT 12;
  `;
  const { rows } = await pool.query(q, [estabelecimento_id]);
  res.json(rows);
});

/* ---------- Health ---------- */
app.get("/health", (_req, res) => res.json({ ok: true }));

app.listen(PORT, () => console.log(`API rodando em http://localhost:${PORT}`));
