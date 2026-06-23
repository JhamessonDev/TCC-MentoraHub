# Mentora — Plataforma de Mentoria com Dashboard Analítico

> TCC — Tecnologia em Análise e Desenvolvimento de Sistemas  
> Centro Universitário Integrado · 2026  
> Aluno: Jhamesson Henriky Amancio

---

## Estrutura do Projeto

```
mentora/
├── backend/                        # API NestJS
│   ├── src/
│   │   ├── modules/                # Módulos de negócio
│   │   │   ├── auth/               # Autenticação JWT
│   │   │   ├── usuarios/           # CRUD de usuários
│   │   │   ├── mentores/           # CRUD de mentores ★ módulo principal
│   │   │   ├── especialidades/     # CRUD de especialidades
│   │   │   ├── sessoes/            # CRUD de sessões
│   │   │   └── avaliacoes/         # CRUD de avaliações
│   │   ├── common/
│   │   │   ├── interceptors/       # LoggingInterceptor (trace ID)
│   │   │   ├── filters/            # HttpExceptionFilter
│   │   │   ├── guards/             # JwtAuthGuard, RolesGuard
│   │   │   ├── decorators/         # @CurrentUser, @Roles, @TraceId
│   │   │   └── pipes/              # Pipes de validação customizados
│   │   ├── config/                 # Configurações tipadas
│   │   └── database/
│   │       ├── migrations/         # Scripts SQL versionados
│   │       └── seeds/              # Dados iniciais para dev/teste
│   ├── test/
│   │   ├── unit/                   # Testes unitários (Jest)
│   │   ├── integration/            # Testes de integração (Supertest)
│   │   └── helpers/                # Factories, builders, helpers
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                       # SPA React + Vite
│   └── src/
│       ├── components/             # Componentes reutilizáveis
│       │   ├── layout/             # Navbar
│       │   └── admin/              # AdminLayout, PrivateRoute
│       ├── pages/                  # Páginas da aplicação
│       │   ├── admin/              # Dashboard e painel administrativo
│       │   └── *.tsx               # Páginas públicas
│       ├── hooks/                  # Custom hooks
│       ├── services/               # Chamadas à API
│       └── types/                  # Tipos TypeScript
│
├── performance/                    # Load tests k6
│   └── load-test.js
│
└── docker-compose.yml              # MySQL + Elasticsearch + Kibana
```

---

## Como rodar o projeto

### Pré-requisitos

| Ferramenta | Versão mínima | Instalação |
|---|---|---|
| Node.js | 20.x | https://nodejs.org |
| Docker | 24.x | https://www.docker.com |
| Docker Compose | v2.x | incluído no Docker Desktop |
| k6 | qualquer | https://k6.io/docs/get-started/installation/ *(opcional — load test)* |

### 1. Clonar o repositório

```bash
git clone https://github.com/JhamessonDev/mentora.git
cd mentora
```

### 2. Subir a infraestrutura

```bash
docker-compose up -d
```

Isso sobe **MySQL 8**, **Elasticsearch 8.11** e **Kibana 8.11**. Aguarde ~30 segundos até o Elasticsearch passar no healthcheck antes de continuar.

```bash
# Verificar se todos os containers estão healthy
docker-compose ps
```

### 3. Aplicar o schema e os seeds no banco

> **Nota:** o MySQL auto-aplica o `init.sql` na primeira inicialização do volume. Se o container MySQL for novo, pule o primeiro comando abaixo e execute apenas o seed. Se o banco já existia, execute ambos.

**Criar as tabelas (schema):**

```bash
docker exec -i mentora_mysql mysql -u root -proot_pass < backend/src/database/migrations/init.sql
```

**Popular com dados de desenvolvimento** (16 mentores, 20 mentorandos, sessões e avaliações):

```bash
docker exec -i mentora_mysql mysql -u root -proot_pass < backend/src/database/seeds/seed_v2.sql
```

### 4. Configurar variáveis de ambiente do backend

```bash
cd backend
cp .env.example .env
```

Os valores padrão do `.env.example` estão alinhados com o `docker-compose.yml` e funcionam sem nenhuma alteração em ambiente local.

### 5. Instalar dependências e rodar o backend

```bash
cd backend
npm install
npm run start:dev
```

O NestJS sobe em modo watch. A API estará disponível em `http://localhost:3000`.

### 6. Instalar dependências e rodar o frontend

Em **outro terminal**, a partir da raiz do projeto:

```bash
cd frontend
npm install
npm run dev
```

O Vite sobe em modo de desenvolvimento. O site estará disponível em `http://localhost:5173`.

### 7. URLs de acesso

| Serviço | URL |
|---|---|
| Site público | http://localhost:5173 |
| Painel administrativo | http://localhost:5173/admin/login |
| API REST | http://localhost:3000/api/v1 |
| Swagger / Docs | http://localhost:3000/docs |
| Kibana (logs) | http://localhost:5601 |
| MySQL | localhost:3306 |

### 8. Credenciais de teste

| Perfil | Email | Senha |
|---|---|---|
| Admin | admin@mentora.com | Mentora@2026 |
| Mentor | ana@email.com | Mentora@2026 |
| Mentorando | jhamesson.henriky@email.com | Mentora@2026 |

> Todos os 37 usuários do seed compartilham a mesma senha `Mentora@2026`.

---

## Testes

Execute a partir do diretório `backend/`:

```bash
# Todos os testes (unitários + integração)
npm test

# Apenas testes unitários
npm run test:unit

# Apenas testes de integração
npm run test:integration

# Cobertura de código
npm run test:cov
```

A suíte possui **35 testes** distribuídos em três arquivos:

- `test/unit/mentores.service.spec.ts` — 11 testes unitários do `MentoresService`
- `test/integration/mentores.controller.spec.ts` — 12 testes de integração do `MentoresController`
- `test/integration/auth.controller.spec.ts` — 12 testes de integração do `AuthController`

---

## Load test com k6

Requer o [k6](https://k6.io/docs/get-started/installation/) instalado e o backend rodando (`npm run start:dev`).

```bash
# A partir da raiz do projeto
k6 run performance/load-test.js
```

O teste simula **20 usuários virtuais** durante 70 segundos (rampa de subida → carga sustentada → pico → descida) e valida:

| Threshold | Critério |
|---|---|
| `http_req_duration` p95 | < 500 ms |
| `latencia_get_mentores` p95 | < 300 ms |
| `latencia_get_mentor_by_id` p95 | < 200 ms |
| `taxa_erros` | < 1 % |

---

## Critérios de aceite dos testes

35 testes verificados automaticamente com `npm test`. Cada linha descreve a condição testada e o resultado esperado pelo sistema.

### Unitários — MentoresService (11)

| Teste | Critério de aceite |
|---|---|
| [Mentores] deve criar mentor com sucesso quando usuário não possui perfil | mentor persistido no banco com todos os dados do DTO |
| [Mentores] deve lançar ConflictException quando usuário já possui perfil de mentor | requisição rejeitada antes de qualquer persistência |
| [Mentores] deve lançar BadRequestException quando especialidade não existe | IDs inválidos detectados antes de salvar o mentor |
| [Mentores] deve retornar mentor quando ID existe | objeto mentor retornado com relações `usuario` e `especialidades` |
| [Mentores] deve lançar NotFoundException quando ID não existe | nenhum dado retornado para ID inexistente |
| [Mentores] deve atualizar mentor com novos dados | campos modificados refletidos no objeto salvo |
| [Mentores] deve lançar NotFoundException ao atualizar mentor inexistente | nenhuma chamada a `save` realizada |
| [Mentores] deve aprovar mentor com sucesso | campo `aprovado` alterado para `true` e persistido |
| [Mentores] deve reprovar mentor com sucesso | campo `aprovado` alterado para `false` e persistido |
| [Mentores] deve remover mentor quando ID existe | `remove` chamado com o objeto correto |
| [Mentores] deve lançar NotFoundException ao remover mentor inexistente | nenhuma chamada a `remove` realizada |

### Integração — MentoresController (12)

| Teste | Critério de aceite |
|---|---|
| [Mentores] deve retornar status 200 e lista paginada | response com `data`, `total`, `page`, `limit` e header `x-trace-id` |
| [Mentores] deve retornar status 200 quando mentor existe | objeto mentor retornado com `id` correto |
| [Mentores] deve retornar status 404 quando mentor não existe | corpo de erro padronizado com campo `traceId` |
| [Mentores] deve retornar status 400 quando ID não é número | parâmetro de rota rejeitado pelo `ParseIntPipe` |
| [Mentores] deve criar mentor e retornar status 201 | mentor criado com `usuarioId` correspondente ao payload |
| [Mentores] deve retornar status 409 quando mentor já existe para o usuário | conflito detectado antes de qualquer inserção |
| [Mentores] deve retornar status 400 quando body está inválido | campos obrigatórios ausentes rejeitados pelo `ValidationPipe` |
| [Mentores] deve atualizar mentor e retornar status 200 | mentor retornado com o campo `precoHora` atualizado |
| [Mentores] deve retornar status 404 ao atualizar mentor inexistente | sem persistência para ID inválido |
| [Mentores] deve aprovar mentor e retornar status 200 | campo `aprovado: true` refletido na resposta |
| [Mentores] deve remover mentor e retornar status 204 | resposta sem corpo e mentor removido do repositório |
| [Mentores] deve retornar status 404 ao deletar mentor inexistente | sem exclusão para ID inválido |

### Integração — AuthController (12)

| Teste | Critério de aceite |
|---|---|
| [Auth] deve retornar 201 quando login com credenciais válidas | usuário recebe JWT válido assinado com `JWT_SECRET` |
| [Auth] deve retornar 401 quando login com senha incorreta | acesso negado, nenhum token emitido |
| [Auth] deve retornar 401 quando acessar profile sem token | `JwtAuthGuard` bloqueia requisições sem `Authorization` |
| [Auth] deve retornar 200 quando acessar profile com token válido | dados do usuário autenticado retornados corretamente |
| [Auth] deve retornar access_token e user no body quando login bem-sucedido | JWT em formato `header.payload.signature` presente no corpo |
| [Auth] deve retornar id, email e tipoUsuario no profile | contrato de resposta do perfil satisfeito na íntegra |
| [Auth] deve retornar 400 quando login sem email | campo obrigatório `email` ausente rejeitado pelo `LoginDto` |
| [Auth] deve retornar 400 quando login sem password | campo obrigatório `password` ausente rejeitado pelo `LoginDto` |
| [Auth] deve retornar 400 quando email inválido | formato de e-mail validado por `@IsEmail()` antes de atingir o serviço |
| [Auth] deve retornar tipoUsuario admin quando login com usuário admin | payload JWT contém o perfil `admin` correspondente ao usuário |
| [Auth] deve bloquear POST /mentores quando usuário não autenticado | `JwtAuthGuard` ativo em todos os endpoints de escrita |
| [Auth] deve permitir GET /mentores sem autenticação | endpoints de leitura permanecem públicos sem necessidade de token |

---

## Segurança

### Autenticação com JWT

Os tokens são assinados com HS256 usando a chave `JWT_SECRET` definida no `.env` e expiram em **7 dias** (`JWT_EXPIRES_IN=7d`). O payload carrega `{ sub, email, tipoUsuario }` — sem dados sensíveis. A renovação fica a cargo do cliente, que deve re-autenticar após o vencimento.

```
POST /api/v1/auth/login  →  { access_token, user }
GET  /api/v1/auth/profile  ← Authorization: Bearer <token>
```

### Hash de senhas com bcrypt

Senhas nunca são armazenadas em texto claro. O campo `senha` usa **bcrypt com fator 10** (`bcryptjs`). A coluna está marcada com `select: false` na entidade TypeORM, garantindo que o hash jamais seja retornado nas consultas padrão — apenas quando explicitamente solicitado via `addSelect`.

### Endpoints públicos vs. protegidos

| Método | Rota | Proteção |
|---|---|---|
| `POST` | `/auth/login` | Pública |
| `GET` | `/mentores` | Pública |
| `GET` | `/mentores/:id` | Pública |
| `POST` | `/mentores` | `JwtAuthGuard` |
| `PUT` | `/mentores/:id` | `JwtAuthGuard` |
| `PATCH` | `/mentores/:id/aprovar` | `JwtAuthGuard` |
| `DELETE` | `/mentores/:id` | `JwtAuthGuard` |
| `GET` | `/auth/profile` | `JwtAuthGuard` |

### RolesGuard — controle por perfil

O `RolesGuard` (em `src/common/guards/roles.guard.ts`) lê o metadado definido pelo decorator `@Roles('admin', 'mentor')` e compara com o campo `tipoUsuario` do payload JWT extraído pelo `JwtStrategy`. Exemplo de uso:

```typescript
@Patch(':id/aprovar')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
aprovar(...) { ... }
```

Os três perfis disponíveis são `admin`, `mentor` e `mentorando` (enum `TipoUsuario`).

---

## Arquitetura

### Monolito modular — justificativa técnica

O Mentora adota arquitetura de **monolito modular** em vez de microserviços. Essa escolha é intencional e fundamentada no escopo do projeto:

**Por que não microserviços?**

Microserviços introduzem complexidade operacional que não se justifica aqui: service discovery, comunicação inter-serviço (gRPC/mensageria), rastreamento distribuído, múltiplos ciclos de deploy e orquestração via Kubernetes. Para um TCC com equipe de um desenvolvedor e prazo definido, esse overhead seria custo sem benefício.

**Por que monolito modular?**

A arquitetura modular do NestJS oferece os benefícios de organização dos microserviços — isolamento de responsabilidades, contratos claros entre módulos, testabilidade independente — sem a complexidade de rede. Cada módulo (`auth`, `usuarios`, `mentores`, `especialidades`, `sessoes`, `avaliacoes`) é **autossuficiente**: tem seu próprio controller, service, entity e DTOs. A comunicação entre módulos ocorre via injeção de dependência, com os exports explicitamente declarados no `@Module`.

**Como escalar se necessário?**

O design atual permite extração de módulos para serviços independentes com esforço mínimo:
1. O módulo já possui fronteiras bem definidas (interfaces de entrada/saída via DTOs)
2. A substituição do TypeORM por chamadas HTTP/gRPC seria localizada no `service`
3. O `AuthModule` pode se tornar um serviço de identidade (OAuth2/OIDC) sem alterar os demais módulos

### Padrão de camadas

```
Request → Controller → Service → Repository → Entity → DB
              ↓            ↓
            DTO       Domain Logic
```

- **Controller**: valida entrada via `ValidationPipe` + DTO, extrai parâmetros, delega ao Service
- **Service**: contém toda a lógica de negócio; única camada que conhece o Repository
- **Repository**: acesso ao MySQL via TypeORM; nenhuma lógica de negócio
- **Entity**: mapeamento objeto-relacional; source of truth do schema
- **DTO**: contratos de entrada/saída com validação automática via `class-validator`

### Princípios SOLID aplicados

| Princípio | Aplicação concreta |
|---|---|
| **S** — Single Responsibility | Cada classe tem uma única razão para mudar: `AuthService` só autentica, `MentoresService` só gerencia mentores |
| **O** — Open/Closed | Guards e interceptors são extensíveis sem modificar o código das rotas (`@UseGuards`, `APP_INTERCEPTOR`) |
| **L** — Liskov Substitution | Repositórios são trocáveis nos testes via `useValue` sem quebrar o contrato do service |
| **I** — Interface Segregation | DTOs separados por operação (`CreateMentorDto`, `UpdateMentorDto`, `AprovarMentorDto`) |
| **D** — Dependency Inversion | Services dependem de abstrações injetadas pelo container do NestJS, não de implementações concretas |

---

## SLAs medidos

Carga executada com **k6** contra `GET /api/v1/mentores` com dados reais de seed, 20 usuários virtuais simultâneos durante 30 segundos.

| Métrica | Resultado |
|---|---|
| Latência p95 | **4,1 ms** |
| Throughput | **12,6 req/s** |
| Taxa de erros | **0%** |
| Usuários virtuais | 20 VUs simultâneos |
| Duração do teste | 30 s |

O p95 de 4,1 ms indica que 95% das requisições foram atendidas em menos de 4,1 ms, bem abaixo do limite de 200 ms considerado aceitável para APIs REST. O throughput de 12,6 req/s é condizente com um ambiente de desenvolvimento local (MySQL em Docker, sem cache).

---

## Observabilidade

- **Trace ID**: cada requisição recebe um UUID único (`x-trace-id` no header)
- **Logs estruturados**: Winston com saída JSON para Elasticsearch
- **Kibana**: visualização de logs em http://localhost:5601
- **Swagger**: documentação automática da API em http://localhost:3000/docs
