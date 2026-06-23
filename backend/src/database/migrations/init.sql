-- ================================================
-- MENTORA — Script de criação do banco de dados
-- Versão: 1.0.0 | 2026
-- ================================================
-- Tabelas:
--   1. usuarios
--   2. especialidades
--   3. mentores
--   4. mentor_especialidade (M:N)
--   5. sessoes
--   6. avaliacoes
-- ================================================

CREATE DATABASE IF NOT EXISTS mentora_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE mentora_db;

-- ── 1. USUÁRIOS ─────────────────────────────────
-- Armazena todos os usuários da plataforma.
-- tipo_usuario distingue admin, mentor e mentorando.
CREATE TABLE IF NOT EXISTS usuarios (
  id            INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  nome          VARCHAR(120)    NOT NULL,
  email         VARCHAR(180)    NOT NULL,
  senha         VARCHAR(255)    NOT NULL,          -- bcrypt hash
  tipo_usuario  ENUM('admin','mentor','mentorando') NOT NULL DEFAULT 'mentorando',
  ativo         TINYINT(1)      NOT NULL DEFAULT 1,
  avatar_url    VARCHAR(500)    NULL,
  created_at    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_usuarios_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── 2. ESPECIALIDADES ────────────────────────────
-- Áreas de conhecimento disponíveis na plataforma.
CREATE TABLE IF NOT EXISTS especialidades (
  id          INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  nome        VARCHAR(80)   NOT NULL,
  descricao   TEXT          NULL,
  icone       VARCHAR(60)   NULL,                  -- ex: "💻", "📈"
  ativo       TINYINT(1)    NOT NULL DEFAULT 1,
  created_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_especialidades_nome (nome)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── 3. MENTORES ──────────────────────────────────
-- Perfil expandido de quem atua como mentor.
-- Relacionamento 1:1 com usuarios.
CREATE TABLE IF NOT EXISTS mentores (
  id               INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  usuario_id       INT UNSIGNED    NOT NULL,
  bio              TEXT            NULL,
  preco_hora       DECIMAL(8,2)    NOT NULL DEFAULT 0.00,
  anos_experiencia INT UNSIGNED    NOT NULL DEFAULT 0,
  linkedin_url     VARCHAR(300)    NULL,
  aprovado         TINYINT(1)      NOT NULL DEFAULT 0, -- admin aprova
  avaliacao_media  DECIMAL(3,2)    NOT NULL DEFAULT 0.00,
  total_sessoes    INT UNSIGNED    NOT NULL DEFAULT 0,
  created_at       DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_mentores_usuario (usuario_id),
  CONSTRAINT fk_mentores_usuario
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── 4. MENTOR_ESPECIALIDADE (M:N) ────────────────
-- Relacionamento Many-to-Many entre mentores e especialidades.
-- Um mentor pode ter N especialidades.
-- Uma especialidade pode pertencer a N mentores.
CREATE TABLE IF NOT EXISTS mentor_especialidade (
  mentor_id        INT UNSIGNED  NOT NULL,
  especialidade_id INT UNSIGNED  NOT NULL,
  created_at       DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (mentor_id, especialidade_id),        -- chave composta
  CONSTRAINT fk_me_mentor
    FOREIGN KEY (mentor_id) REFERENCES mentores(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_me_especialidade
    FOREIGN KEY (especialidade_id) REFERENCES especialidades(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── 5. SESSOES ───────────────────────────────────
-- Agendamentos de mentoria entre mentor e mentorando.
CREATE TABLE IF NOT EXISTS sessoes (
  id            INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  mentor_id     INT UNSIGNED  NOT NULL,
  mentorando_id INT UNSIGNED  NOT NULL,
  data_hora     DATETIME      NOT NULL,
  duracao_min   INT UNSIGNED  NOT NULL DEFAULT 60,   -- duração em minutos
  modalidade    ENUM('online','presencial') NOT NULL DEFAULT 'online',
  status        ENUM('agendada','confirmada','realizada','cancelada') NOT NULL DEFAULT 'agendada',
  valor         DECIMAL(8,2)  NOT NULL DEFAULT 0.00,
  objetivo      TEXT          NULL,                  -- objetivo declarado pelo mentorando
  notas         TEXT          NULL,                  -- notas pós-sessão do mentor
  created_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_sessoes_mentor
    FOREIGN KEY (mentor_id) REFERENCES mentores(id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_sessoes_mentorando
    FOREIGN KEY (mentorando_id) REFERENCES usuarios(id)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── 6. AVALIACOES ────────────────────────────────
-- Avaliação feita pelo mentorando após uma sessão realizada.
-- Relacionamento 1:1 com sessoes.
CREATE TABLE IF NOT EXISTS avaliacoes (
  id          INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  sessao_id   INT UNSIGNED  NOT NULL,
  nota        TINYINT       NOT NULL CHECK (nota BETWEEN 1 AND 5),
  comentario  TEXT          NULL,
  created_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_avaliacoes_sessao (sessao_id),      -- 1 avaliação por sessão
  CONSTRAINT fk_avaliacoes_sessao
    FOREIGN KEY (sessao_id) REFERENCES sessoes(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ================================================
-- ÍNDICES DE PERFORMANCE
-- ================================================
CREATE INDEX idx_sessoes_mentor     ON sessoes(mentor_id);
CREATE INDEX idx_sessoes_mentorando ON sessoes(mentorando_id);
CREATE INDEX idx_sessoes_status     ON sessoes(status);
CREATE INDEX idx_sessoes_data_hora  ON sessoes(data_hora);
CREATE INDEX idx_mentores_aprovado  ON mentores(aprovado);
