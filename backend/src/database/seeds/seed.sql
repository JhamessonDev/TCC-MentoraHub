-- ================================================
-- MENTORA — Seeds (dados de exemplo)
-- Execute após o init.sql
-- ================================================

USE mentora_db;

-- ── USUÁRIOS ─────────────────────────────────────
-- Senha de todos: Mentora@2026 (hash bcrypt rounds=10)
INSERT INTO usuarios (nome, email, senha, tipo_usuario) VALUES
  ('Admin Mentora',       'admin@mentora.com',    '$2a$10$neWBP/oS7X6pPBoVskCV1.qx9SnbZep8PQ4MGcxQ5nm4Y6OQkFzD2', 'admin'),
  ('Ana Lima',            'ana@email.com',         '$2a$10$neWBP/oS7X6pPBoVskCV1.qx9SnbZep8PQ4MGcxQ5nm4Y6OQkFzD2', 'mentor'),
  ('Pedro Costa',         'pedro@email.com',       '$2a$10$neWBP/oS7X6pPBoVskCV1.qx9SnbZep8PQ4MGcxQ5nm4Y6OQkFzD2', 'mentor'),
  ('Maria Souza',         'maria@email.com',       '$2a$10$neWBP/oS7X6pPBoVskCV1.qx9SnbZep8PQ4MGcxQ5nm4Y6OQkFzD2', 'mentor'),
  ('Carlos Mendes',       'carlos@email.com',      '$2a$10$neWBP/oS7X6pPBoVskCV1.qx9SnbZep8PQ4MGcxQ5nm4Y6OQkFzD2', 'mentor'),
  ('Juliana Reis',        'juliana@email.com',     '$2a$10$neWBP/oS7X6pPBoVskCV1.qx9SnbZep8PQ4MGcxQ5nm4Y6OQkFzD2', 'mentor'),
  ('Fernando Alves',      'fernando@email.com',    '$2a$10$neWBP/oS7X6pPBoVskCV1.qx9SnbZep8PQ4MGcxQ5nm4Y6OQkFzD2', 'mentor'),
  ('Jhamesson Henriky',   'jhamesson@email.com',   '$2a$10$neWBP/oS7X6pPBoVskCV1.qx9SnbZep8PQ4MGcxQ5nm4Y6OQkFzD2', 'mentorando'),
  ('Lucas Oliveira',      'lucas@email.com',       '$2a$10$neWBP/oS7X6pPBoVskCV1.qx9SnbZep8PQ4MGcxQ5nm4Y6OQkFzD2', 'mentorando'),
  ('Beatriz Santos',      'beatriz@email.com',     '$2a$10$neWBP/oS7X6pPBoVskCV1.qx9SnbZep8PQ4MGcxQ5nm4Y6OQkFzD2', 'mentorando'),
  ('Rafael Moreira',      'rafael@email.com',      '$2a$10$neWBP/oS7X6pPBoVskCV1.qx9SnbZep8PQ4MGcxQ5nm4Y6OQkFzD2', 'mentorando'),
  ('Camila Torres',       'camila@email.com',      '$2a$10$neWBP/oS7X6pPBoVskCV1.qx9SnbZep8PQ4MGcxQ5nm4Y6OQkFzD2', 'mentorando');

-- ── ESPECIALIDADES ───────────────────────────────
INSERT INTO especialidades (nome, descricao, icone) VALUES
  ('Product Management',  'Gestão de produto, roadmap, OKRs e metodologias ágeis',        '🧩'),
  ('Tecnologia',          'Desenvolvimento de software, arquitetura e boas práticas',      '💻'),
  ('Finanças',            'Finanças pessoais, investimentos e planejamento financeiro',    '📈'),
  ('Negócios',            'Empreendedorismo, startups, modelos de negócio e estratégia',  '🚀'),
  ('Marketing Digital',   'Growth, SEO, mídia paga e estratégias de aquisição',           '📣'),
  ('Carreira',            'Desenvolvimento profissional, transição de carreira e liderança','🎯');

-- ── MENTORES ─────────────────────────────────────
INSERT INTO mentores (usuario_id, bio, preco_hora, anos_experiencia, linkedin_url, aprovado, avaliacao_media, total_sessoes) VALUES
  (2,  'PM com 8 anos de experiência em startups e scale-ups. Já lancei mais de 12 produtos digitais.',                    150.00, 8,  'linkedin.com/in/analima',     1, 4.90, 32),
  (3,  'Engenheiro de software sênior com foco em back-end e arquitetura de sistemas distribuídos.',                       120.00, 6,  'linkedin.com/in/pedrocosta',  1, 4.70, 21),
  (4,  'CFO com passagem por grandes consultorias. Especialista em finanças para startups e PMEs.',                        180.00, 12, 'linkedin.com/in/mariasouza',  1, 4.80, 18),
  (5,  'Designer UX/UI com foco em produtos digitais. Já trabalhei em empresas como iFood e Nubank.',                     100.00, 5,  'linkedin.com/in/carlosmendes',1, 4.60, 14),
  (6,  'Head de Marketing com expertise em growth hacking e estratégias de aquisição orgânica.',                           130.00, 7,  'linkedin.com/in/juliananreis',1, 4.50, 11),
  (7,  'Serial entrepreneur com 3 startups fundadas. Mentor de negócios com foco em validação e tração.',                 200.00, 15, 'linkedin.com/in/fernandoalves',1,4.85, 27);

-- ── MENTOR_ESPECIALIDADE (M:N) ───────────────────
INSERT INTO mentor_especialidade (mentor_id, especialidade_id) VALUES
  -- Ana Lima: PM + Negócios + Carreira
  (1, 1), (1, 4), (1, 6),
  -- Pedro Costa: Tecnologia + Carreira
  (2, 2), (2, 6),
  -- Maria Souza: Finanças + Negócios
  (3, 3), (3, 4),
  -- Carlos Mendes: Tecnologia + Marketing Digital
  (4, 2), (4, 5),
  -- Juliana Reis: Marketing Digital + Carreira
  (5, 5), (5, 6),
  -- Fernando Alves: Negócios + Finanças + Carreira
  (6, 4), (6, 3), (6, 6);

-- ── SESSÕES ──────────────────────────────────────
INSERT INTO sessoes (mentor_id, mentorando_id, data_hora, duracao_min, modalidade, status, valor, objetivo) VALUES
  (1, 8,  '2026-03-10 10:00:00', 60,  'online',     'realizada',  150.00, 'Entender como estruturar um roadmap de produto'),
  (1, 9,  '2026-03-15 14:00:00', 60,  'online',     'realizada',  150.00, 'Dúvidas sobre metodologias ágeis e OKRs'),
  (2, 8,  '2026-03-20 09:00:00', 60,  'online',     'realizada',  120.00, 'Revisão de arquitetura do meu projeto de TCC'),
  (3, 10, '2026-04-01 11:00:00', 60,  'online',     'realizada',  180.00, 'Planejamento financeiro para abrir MEI'),
  (4, 11, '2026-04-05 16:00:00', 30,  'online',     'realizada',  100.00, 'Feedback no meu portfólio de design'),
  (5, 12, '2026-04-10 10:00:00', 60,  'online',     'realizada',  130.00, 'Estratégia de marketing para produto SaaS'),
  (6, 9,  '2026-04-12 15:00:00', 90,  'online',     'realizada',  300.00, 'Validação da minha ideia de startup'),
  (1, 10, '2026-04-20 10:00:00', 60,  'online',     'agendada',   150.00, 'Transição de carreira para produto'),
  (2, 11, '2026-04-22 14:00:00', 60,  'presencial', 'agendada',   120.00, 'Arquitetura de microsserviços'),
  (3, 12, '2026-04-25 09:00:00', 60,  'online',     'agendada',   180.00, 'Investimentos para iniciantes');

-- ── AVALIAÇÕES ───────────────────────────────────
INSERT INTO avaliacoes (sessao_id, nota, comentario) VALUES
  (1, 5, 'Sessão incrível! A Ana explicou o framework de priorização de forma muito clara.'),
  (2, 5, 'Muito didática e paciente. Já estou aplicando os OKRs no meu trabalho.'),
  (3, 4, 'Pedro é muito técnico e experiente. Só achei a sessão um pouco rápida.'),
  (4, 5, 'Maria mudou minha visão sobre finanças. Saí com um plano de ação concreto.'),
  (5, 4, 'Carlos deu feedbacks precisos no portfólio. Recomendo para quem está iniciando.'),
  (6, 5, 'Juliana é excelente! Me mostrou canais de aquisição que eu nem conhecia.'),
  (7, 5, 'Fernando é apaixonante. 90 minutos que valeram mais do que meses de curso.');
