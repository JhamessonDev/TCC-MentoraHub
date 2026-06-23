-- ================================================
-- MENTORA HUB — Seed completo (reset)
-- 16 mentores, 20 mentorandos, sessões e avaliações
-- ================================================

USE mentora_db;

-- Desativa checagem de FK temporariamente para truncar em qualquer ordem
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE avaliacoes;
TRUNCATE TABLE sessoes;
TRUNCATE TABLE mentor_especialidade;
TRUNCATE TABLE mentores;
TRUNCATE TABLE especialidades;
TRUNCATE TABLE usuarios;
SET FOREIGN_KEY_CHECKS = 1;

-- ── ESPECIALIDADES ───────────────────────────────
INSERT INTO especialidades (nome, descricao, icone) VALUES
  ('Product Management',  'Gestão de produto, roadmap, OKRs e metodologias ágeis',        '🧩'),
  ('Tecnologia',          'Desenvolvimento de software, arquitetura e boas práticas',      '💻'),
  ('Finanças',            'Finanças pessoais, investimentos e planejamento financeiro',    '📈'),
  ('Negócios',            'Empreendedorismo, startups, modelos de negócio e estratégia',  '🚀'),
  ('Marketing Digital',   'Growth, SEO, mídia paga e estratégias de aquisição',           '📣'),
  ('Carreira',            'Desenvolvimento profissional, transição de carreira e liderança','🎯'),
  ('Design',              'UX/UI Design, design de produto e pesquisa com usuários',      '🎨'),
  ('Dados e BI',          'Análise de dados, Business Intelligence e Data Science',        '📊'),
  ('Vendas',              'Estratégias de vendas B2B, B2C e gestão de funil comercial',    '💼'),
  ('Recursos Humanos',    'Gestão de pessoas, recrutamento e desenvolvimento organizacional', '🧑‍💼');

-- ── USUÁRIOS (1 admin + 16 mentores + 20 mentorandos) ──
-- Senha de todos: Mentora@2026
INSERT INTO usuarios (nome, email, senha, tipo_usuario) VALUES
  ('Admin Mentora',        'admin@mentora.com',     '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin'),
  -- Mentores (id 2-17)
  ('Ana Lima',             'ana@email.com',          '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'mentor'),
  ('Pedro Costa',          'pedro@email.com',        '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'mentor'),
  ('Maria Souza',          'maria@email.com',        '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'mentor'),
  ('Carlos Mendes',        'carlos@email.com',       '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'mentor'),
  ('Juliana Reis',         'juliana@email.com',      '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'mentor'),
  ('Fernando Alves',       'fernando@email.com',     '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'mentor'),
  ('Beatriz Carvalho',     'beatriz.c@email.com',    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'mentor'),
  ('Rodrigo Nascimento',   'rodrigo@email.com',      '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'mentor'),
  ('Camila Ferreira',      'camila.f@email.com',     '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'mentor'),
  ('Lucas Martins',        'lucas.m@email.com',      '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'mentor'),
  ('Patrícia Gomes',       'patricia@email.com',     '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'mentor'),
  ('Diego Santos',         'diego@email.com',        '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'mentor'),
  ('Larissa Pinto',        'larissa@email.com',      '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'mentor'),
  ('Gustavo Ramos',        'gustavo@email.com',      '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'mentor'),
  ('Amanda Rocha',         'amanda@email.com',       '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'mentor'),
  ('Thiago Barbosa',       'thiago@email.com',       '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'mentor'),
  -- Mentorandos (id 18-37)
  ('Jhamesson Henriky',    'jhamesson.henriky@email.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'mentorando'),
  ('Lucas Oliveira',       'lucas@email.com',        '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'mentorando'),
  ('Beatriz Santos',       'beatriz@email.com',      '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'mentorando'),
  ('Rafael Moreira',       'rafael@email.com',       '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'mentorando'),
  ('Camila Torres',        'camila@email.com',       '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'mentorando'),
  ('Bruno Cardoso',        'bruno@email.com',        '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'mentorando'),
  ('Letícia Almeida',      'leticia@email.com',      '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'mentorando'),
  ('Felipe Souza',         'felipe@email.com',       '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'mentorando'),
  ('Mariana Lopes',        'mariana@email.com',      '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'mentorando'),
  ('Gabriel Dias',         'gabriel@email.com',      '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'mentorando'),
  ('Isabela Castro',       'isabela@email.com',      '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'mentorando'),
  ('Eduardo Pereira',      'eduardo@email.com',      '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'mentorando'),
  ('Fernanda Cunha',       'fernanda@email.com',     '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'mentorando'),
  ('Vinícius Teixeira',    'vinicius@email.com',     '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'mentorando'),
  ('Bianca Correia',       'bianca@email.com',       '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'mentorando'),
  ('Matheus Araújo',       'matheus@email.com',      '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'mentorando'),
  ('Sofia Barros',         'sofia@email.com',        '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'mentorando'),
  ('Henrique Nunes',       'henrique@email.com',     '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'mentorando'),
  ('Júlia Monteiro',       'julia@email.com',        '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'mentorando'),
  ('Caio Ribeiro',         'caio@email.com',         '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'mentorando');

-- ── MENTORES (perfil expandido, usuario_id 2-17) ────
INSERT INTO mentores (usuario_id, bio, preco_hora, anos_experiencia, linkedin_url, aprovado, avaliacao_media, total_sessoes) VALUES
  (2,  'PM com 8 anos de experiência em startups e scale-ups. Já lancei mais de 12 produtos digitais.',                    150.00, 8,  'linkedin.com/in/analima',       1, 4.90, 32),
  (3,  'Engenheiro de software sênior com foco em back-end e arquitetura de sistemas distribuídos.',                       120.00, 6,  'linkedin.com/in/pedrocosta',    1, 4.70, 21),
  (4,  'CFO com passagem por grandes consultorias. Especialista em finanças para startups e PMEs.',                        180.00, 12, 'linkedin.com/in/mariasouza',    1, 4.80, 18),
  (5,  'Designer UX/UI com foco em produtos digitais. Já trabalhei em empresas como iFood e Nubank.',                     100.00, 5,  'linkedin.com/in/carlosmendes',  1, 4.60, 14),
  (6,  'Head de Marketing com expertise em growth hacking e estratégias de aquisição orgânica.',                           130.00, 7,  'linkedin.com/in/juliananreis',  1, 4.50, 11),
  (7,  'Serial entrepreneur com 3 startups fundadas. Mentor de negócios com foco em validação e tração.',                 200.00, 15, 'linkedin.com/in/fernandoalves', 1, 4.85, 27),
  (8,  'Engenheira de dados com 9 anos de experiência em pipelines de Big Data e arquitetura analítica.',                  160.00, 9,  'linkedin.com/in/beatrizcarvalho', 1, 4.75, 19),
  (9,  'VP de Vendas com histórico de crescimento de receita em empresas SaaS B2B.',                                       170.00, 11, 'linkedin.com/in/rodrigonascimento', 1, 4.65, 16),
  (10, 'Diretora de RH com foco em cultura organizacional e processos de recrutamento estruturado.',                       110.00, 10, 'linkedin.com/in/camilaferreira', 1, 4.55, 9),
  (11, 'Tech Lead especializado em arquitetura de microsserviços e sistemas escaláveis na nuvem.',                         140.00, 7,  'linkedin.com/in/lucasmartins',  1, 4.70, 23),
  (12, 'Cientista de dados com mestrado em IA. Atua com Machine Learning aplicado a negócios.',                            190.00, 6,  'linkedin.com/in/patriciagomes', 1, 4.92, 15),
  (13, 'Especialista em Growth Marketing com foco em performance e aquisição paga.',                                       115.00, 5,  'linkedin.com/in/diegosantos',   1, 4.40, 8),
  (14, 'Product Designer com passagem por unicórnios brasileiros. Foco em design systems.',                                125.00, 6,  'linkedin.com/in/larissapinto',  1, 4.68, 12),
  (15, 'Diretor financeiro com experiência em fusões e aquisições e captação de investimento.',                            210.00, 14, 'linkedin.com/in/gustavoramos',  1, 4.88, 22),
  (16, 'Coach de carreira certificado, ajuda profissionais em transição para tech e produto.',                             95.00,  9,  'linkedin.com/in/amandarocha',   1, 4.77, 17),
  (17, 'Engenheiro de software full-stack, especialista em React, Node.js e arquitetura de APIs.',                        135.00, 7,  'linkedin.com/in/thiagobarbosa', 1, 4.62, 13);

-- ── MENTOR_ESPECIALIDADE (M:N) ───────────────────
INSERT INTO mentor_especialidade (mentor_id, especialidade_id) VALUES
  (1, 1), (1, 4), (1, 6),               -- Ana Lima: PM, Negócios, Carreira
  (2, 2), (2, 6),                       -- Pedro Costa: Tecnologia, Carreira
  (3, 3), (3, 4),                       -- Maria Souza: Finanças, Negócios
  (4, 2), (4, 5), (4, 7),               -- Carlos Mendes: Tecnologia, Marketing, Design
  (5, 5), (5, 6),                       -- Juliana Reis: Marketing, Carreira
  (6, 4), (6, 3), (6, 6),               -- Fernando Alves: Negócios, Finanças, Carreira
  (7, 8), (7, 2),                       -- Beatriz Carvalho: Dados e BI, Tecnologia
  (8, 9), (8, 4),                       -- Rodrigo Nascimento: Vendas, Negócios
  (9, 10), (9, 6),                      -- Camila Ferreira: RH, Carreira
  (10, 2), (10, 1),                     -- Lucas Martins: Tecnologia, PM
  (11, 8), (11, 2),                     -- Patrícia Gomes: Dados e BI, Tecnologia
  (12, 5), (12, 9),                     -- Diego Santos: Marketing, Vendas
  (13, 7), (13, 1),                     -- Larissa Pinto: Design, PM
  (14, 3), (14, 4),                     -- Gustavo Ramos: Finanças, Negócios
  (15, 6), (15, 10),                    -- Amanda Rocha: Carreira, RH
  (16, 2), (16, 8);                     -- Thiago Barbosa: Tecnologia, Dados e BI

-- ── SESSÕES (variadas, passadas e futuras) ───────
INSERT INTO sessoes (mentor_id, mentorando_id, data_hora, duracao_min, modalidade, status, valor, objetivo) VALUES
  (1,  18, '2026-03-10 10:00:00', 60, 'online',     'realizada', 150.00, 'Entender como estruturar um roadmap de produto'),
  (1,  19, '2026-03-15 14:00:00', 60, 'online',     'realizada', 150.00, 'Dúvidas sobre metodologias ágeis e OKRs'),
  (2,  18, '2026-03-20 09:00:00', 60, 'online',     'realizada', 120.00, 'Revisão de arquitetura do meu projeto de TCC'),
  (3,  20, '2026-04-01 11:00:00', 60, 'online',     'realizada', 180.00, 'Planejamento financeiro para abrir MEI'),
  (4,  21, '2026-04-05 16:00:00', 30, 'online',     'realizada', 100.00, 'Feedback no meu portfólio de design'),
  (5,  22, '2026-04-10 10:00:00', 60, 'online',     'realizada', 130.00, 'Estratégia de marketing para produto SaaS'),
  (6,  19, '2026-04-12 15:00:00', 90, 'online',     'realizada', 300.00, 'Validação da minha ideia de startup'),
  (7,  23, '2026-04-15 09:00:00', 60, 'online',     'realizada', 160.00, 'Como estruturar pipelines de dados'),
  (8,  24, '2026-04-18 14:00:00', 60, 'presencial', 'realizada', 170.00, 'Estratégias de vendas para SaaS B2B'),
  (9,  25, '2026-04-20 11:00:00', 60, 'online',     'realizada', 110.00, 'Processo seletivo estruturado para startups'),
  (10, 26, '2026-04-22 10:00:00', 60, 'online',     'realizada', 140.00, 'Migração para arquitetura de microsserviços'),
  (11, 27, '2026-04-25 16:00:00', 90, 'online',     'realizada', 285.00, 'Introdução a Machine Learning aplicado'),
  (12, 28, '2026-04-28 09:00:00', 60, 'online',     'realizada', 115.00, 'Campanhas de performance e ROI'),
  (13, 29, '2026-05-02 14:00:00', 60, 'online',     'realizada', 125.00, 'Como montar um design system'),
  (14, 30, '2026-05-05 11:00:00', 60, 'online',     'realizada', 210.00, 'Captação de investimento seed'),
  (15, 31, '2026-05-08 15:00:00', 60, 'online',     'realizada', 95.00,  'Transição de carreira para produto'),
  (16, 32, '2026-05-10 10:00:00', 60, 'presencial', 'realizada', 135.00, 'Boas práticas de API REST'),
  (1,  20, '2026-05-12 14:00:00', 60, 'online',     'realizada', 150.00, 'Priorização de backlog com RICE'),
  (2,  33, '2026-05-15 09:00:00', 60, 'online',     'realizada', 120.00, 'Code review e clean code'),
  (3,  34, '2026-05-18 11:00:00', 60, 'online',     'realizada', 180.00, 'Investimentos para iniciantes'),
  (6,  35, '2026-05-20 16:00:00', 90, 'online',     'realizada', 300.00, 'Plano de negócios para startup'),
  (7,  36, '2026-05-22 10:00:00', 60, 'online',     'realizada', 160.00, 'Modelagem de dados para BI'),
  (1,  21, '2026-06-20 10:00:00', 60, 'online',     'agendada',  150.00, 'Transição de carreira para produto'),
  (2,  22, '2026-06-22 14:00:00', 60, 'presencial', 'agendada',  120.00, 'Arquitetura de microsserviços'),
  (3,  23, '2026-06-25 09:00:00', 60, 'online',     'agendada',  180.00, 'Investimentos para iniciantes'),
  (11, 37, '2026-06-28 11:00:00', 60, 'online',     'agendada',  140.00, 'Fundamentos de Data Science'),
  (12, 18, '2026-07-01 15:00:00', 60, 'online',     'agendada',  190.00, 'Como migrar de analista para cientista de dados'),
  (9,  24, '2026-07-03 10:00:00', 60, 'online',     'confirmada', 170.00, 'Funil de vendas e CRM'),
  (15, 25, '2026-07-05 14:00:00', 60, 'online',     'confirmada', 210.00, 'Avaliação de empresas (valuation)'),
  (16, 26, '2026-07-08 09:00:00', 60, 'online',     'agendada',  95.00,  'Preparação para entrevistas técnicas');

-- ── AVALIAÇÕES (apenas para sessões realizadas) ──
INSERT INTO avaliacoes (sessao_id, nota, comentario) VALUES
  (1,  5, 'Sessão incrível! A Ana explicou o framework de priorização de forma muito clara.'),
  (2,  5, 'Muito didática e paciente. Já estou aplicando os OKRs no meu trabalho.'),
  (3,  4, 'Pedro é muito técnico e experiente. Só achei a sessão um pouco rápida.'),
  (4,  5, 'Maria mudou minha visão sobre finanças. Saí com um plano de ação concreto.'),
  (5,  4, 'Carlos deu feedbacks precisos no portfólio. Recomendo para quem está iniciando.'),
  (6,  5, 'Juliana é excelente! Me mostrou canais de aquisição que eu nem conhecia.'),
  (7,  5, 'Fernando é apaixonante. 90 minutos que valeram mais do que meses de curso.'),
  (8,  5, 'Beatriz domina muito bem o assunto de pipelines de dados. Sessão excelente.'),
  (9,  4, 'Rodrigo trouxe exemplos práticos de vendas B2B muito relevantes.'),
  (10, 5, 'Camila me ajudou a estruturar todo o processo de recrutamento da minha empresa.'),
  (11, 4, 'Lucas explicou microsserviços de forma muito didática, recomendo.'),
  (12, 5, 'Patrícia é incrível! Aprendi mais em 90 min do que em semanas estudando sozinho.'),
  (13, 4, 'Diego trouxe boas dicas de growth, mas senti falta de mais exemplos práticos.'),
  (14, 5, 'Larissa tem um olhar de design muito refinado. Sessão transformadora.'),
  (15, 5, 'Gustavo é extremamente experiente em captação. Vale cada centavo.'),
  (16, 5, 'Amanda me ajudou a enxergar oportunidades que eu não tinha percebido.'),
  (17, 4, 'Thiago é muito didático ao explicar conceitos de API REST.'),
  (18, 5, 'Ana novamente incrível. Já é a segunda sessão e seguirei fazendo mentoria com ela.'),
  (19, 5, 'Pedro fez um code review detalhado, aprendi muito sobre clean code.'),
  (20, 4, 'Maria trouxe insights valiosos sobre o mercado de investimentos.'),
  (21, 5, 'Fernando ajudou a estruturar todo o plano de negócios da minha startup.'),
  (22, 5, 'Beatriz é uma excelente mentora em modelagem de dados.');
