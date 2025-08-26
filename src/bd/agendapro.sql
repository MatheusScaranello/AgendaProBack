-- Tabela Estabelecimento
CREATE TABLE Estabelecimento (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    telefone VARCHAR(20),
    plano VARCHAR(100),
    ultima_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    senha TEXT NOT NULL
);

-- Tabela Profissionais
CREATE TABLE Profissionais (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    valor_recebido NUMERIC(10,2) DEFAULT 0,
    estabelecimento_id INT REFERENCES Estabelecimento(id) ON DELETE CASCADE
);

-- Tabela Clientes
CREATE TABLE Clientes (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    telefone VARCHAR(20),
    email VARCHAR(255),
    valor_gasto NUMERIC(10,2) DEFAULT 0,
    observacoes TEXT,
    frequencia INT DEFAULT 0,
    valor_perdido NUMERIC(10,2) DEFAULT 0,
    estabelecimento_id INT REFERENCES Estabelecimento(id) ON DELETE CASCADE
);

CREATE TABLE Agendamentos (
    id SERIAL PRIMARY KEY,
    cliente_id INT REFERENCES Clientes(id) ON DELETE CASCADE,
    profissional_id INT REFERENCES Profissionais(id) ON DELETE CASCADE,
    data_hora TIMESTAMP NOT NULL,
    status VARCHAR(50) DEFAULT 'pendente'
);
