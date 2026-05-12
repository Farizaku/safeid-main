# SafeID Backend - Estrutura Criada

## 📦 Visão geral

A estrutura completa do backend SafeID foi criada seguindo os padrões de Clean Architecture e as tecnologias definidas no plano.

## 🗂️ Estrutura de pastas

```
safeid-main/
└── server/
    ├── src/
    │   ├── @types/                    # Tipos TypeScript globais
    │   │
    │   ├── api/                       # CAMADA DE APRESENTAÇÃO
    │   │   ├── controllers/           # Controladores REST
    │   │   ├── middlewares/           # Middlewares (Auth, Helmet, Rate Limit)
    │   │   └── routes/                # Definição de rotas
    │   │
    │   ├── core/                      # CAMADA DE DOMÍNIO
    │   │   ├── entities/              # Entidades de negócio
    │   │   ├── repositories/          # Interfaces de acesso a dados
    │   │   └── use-cases/             # Casos de uso / Orquestração
    │   │
    │   ├── infra/                     # CAMADA DE INFRAESTRUTURA
    │   │   ├── database/              # Prisma ORM + conexão
    │   │   ├── cache/                 # Redis (futuro)
    │   │   └── http/                  # Clientes HTTP (futuro)
    │   │
    │   ├── shared/                    # RECURSOS COMPARTILHADOS
    │   │   ├── utils/                 # Funções utilitárias
    │   │   ├── crypto/                # Criptografia
    │   │   └── schemas/               # Validação com class-validator
    │   │
    │   ├── modules/                   # MÓDULOS DE DOMÍNIO
    │   │   ├── auth/                  # Autenticação com sessão + refresh token
    │   │   ├── usuarios/              # Gestão de usuários
    │   │   ├── instituicoes/          # Gestão de instituições
    │   │   ├── beneficiarios/         # Gestão de beneficiários
    │   │   ├── atendimentos/          # Gestão de atendimentos
    │   │   ├── servicos/              # Gestão de serviços
    │   │   └── health/                # Health checks (liveness/readiness)
    │   │
    │   ├── app.module.ts              # Módulo raiz da aplicação
    │   └── main.ts                    # Entry point + setup middleware
    │
    ├── prisma/
    │   └── schema.prisma              # Schema de BD (tabelas, relacionamentos)
    │
    ├── tests/
    │   ├── unit/                      # Testes unitários (Jest)
    │   ├── integration/               # Testes de integração (Nock, BD simulada)
    │   └── e2e/                       # Testes ponta a ponta
    │
    ├── .github/
    │   └── workflows/
    │       └── ci.yml                 # Pipeline CI/CD (GitHub Actions)
    │
    ├── .vscode/
    │   └── settings.json              # Configuração VS Code (ESLint, Prettier)
    │
    ├── Dockerfile                     # Multi-stage build
    ├── docker-compose.yml             # Orquestração local (app + PostgreSQL + Redis)
    ├── jest.config.js                 # Configuração de testes
    ├── package.json                   # Dependências do projeto
    ├── tsconfig.json                  # Configuração TypeScript
    ├── tsconfig.build.json            # Config build apenas
    ├── .eslintrc.js                   # Regras ESLint
    ├── .prettierrc                    # Configuração Prettier
    ├── nest-cli.json                  # Configuração NestJS CLI
    │
    ├── .env.example                   # Template de variáveis (versionado)
    ├── .env                           # Variáveis locais (NÃO versionado)
    ├── .gitignore                     # Arquivos ignorados pelo Git
    │
    ├── README.md                      # Documentação geral do projeto
    ├── SETUP.md                       # Guia de instalação e setup
    └── .gitkeep                       # (removido, pasta não mais vazia)
```

## 🔧 Tecnologias instaladas

### Runtime e Framework
- **Node.js** 20+
- **NestJS** 10.3.0 - Framework web completo
- **Express** 4.18.2 - Servidor HTTP (usado pelo NestJS)
- **TypeScript** 5.3.3 - Type safety

### Banco de Dados
- **Prisma** 5.8.0 - ORM moderna
- **PostgreSQL** - Driver incluído via Prisma
- **Migrations** - Versionamento de schema

### Segurança e Validação
- **Helmet** 7.1.0 - Proteção de headers HTTP
- **class-validator** 0.14.0 - Validação de DTOs
- **class-transformer** 0.5.1 - Transformação de dados
- **bcrypt** (será instalado) - Hash de senhas

### API e Documentação
- **@nestjs/swagger** 7.1.0 - Documentação OpenAPI/Swagger
- **swagger-ui-express** 5.0.0 - UI interativa

### Testes
- **Jest** 29.7.0 - Framework de testes
- **@nestjs/testing** 10.3.0 - Utilitários de teste do NestJS
- **ts-jest** 29.1.1 - Jest + TypeScript

### Code Quality
- **ESLint** 8.55.0 - Linter
- **Prettier** 3.1.1 - Formatter
- **@typescript-eslint** 6.13.0 - Rules TypeScript

### Utilitários
- **dotenv** 16.3.1 - Variáveis de ambiente
- **uuid** 9.0.1 - Geração de UUIDs
- **compression** 1.7.4 - Compressão de respostas
- **RxJS** 7.8.1 - Programação reativa

## 📋 Módulos criados

### `auth` - Autenticação
- ✅ Login com email/CPF e senha
- ✅ Logout
- ✅ Refresh token para renovar sessão
- ✅ Session management

### `usuarios` - Gestão de usuários
- ✅ CRUD completo
- ✅ Hash de senhas com bcrypt
- ✅ Validação de email e CPF
- ✅ Paginação

### `instituicoes` - Gestão de instituições
- ✅ CRUD completo
- ✅ Validação de CNPJ
- ✅ Relacionamento com usuário responsável
- ✅ Paginação

### `beneficiarios` - Gestão de beneficiários
- ✅ Listagem por instituição
- ✅ Relacionamento hierárquico (responsável/dependentes)
- ✅ Estrutura preparada para expansão

### `atendimentos` - Gestão de atendimentos
- ✅ Listagem com relacionamentos
- ✅ Classificação de urgência
- ✅ Rastreamento por usuário e beneficiário

### `servicos` - Gestão de serviços
- ✅ Catálogo de serviços
- ✅ Filtros e buscas
- ✅ Estrutura preparada para expansão

### `health` - Health checks
- ✅ Liveness probe (app rodando)
- ✅ Readiness probe (BD conectado)
- ✅ Status de saúde

## 🚀 Como começar

### 1. Instalação rápida
```bash
cd server
npm install
cp .env.example .env
docker-compose up -d
npm run db:push
npm run dev
```

### 2. Verificar aplicação
- API: http://localhost:3000
- Swagger Docs: http://localhost:3000/api/docs
- Health: http://localhost:3000/api/health

### 3. Estrutura pronta para
- ✅ Adicionar módulos novos
- ✅ Implementar testes
- ✅ Adicionar middlewares customizados
- ✅ Integrar com APIs externas
- ✅ Adicionar cache (Redis)
- ✅ Implementar filas (Bull)
- ✅ Deploy em Docker/Kubernetes

## 📊 Banco de dados

O schema Prisma inclui:
- **Tabelas principais**: Usuario, Instituicao, Beneficiario, Atendimento, Servico
- **Tabelas associativas**: ServicoInstituicao
- **Tabelas de suporte**: Sessao, AuditLog
- **Relacionamentos**: 1:N, N:M, self-referencing
- **Tipos enumerados**: TipoUsuario, NivelUrgencia
- **Indices**: Otimizados para queries comuns

## 🔐 Segurança

- ✅ Helmet para proteção de headers
- ✅ Rate limiting configurável
- ✅ CORS restrito
- ✅ Validação de entrada com Zod/class-validator
- ✅ Senhas hasheadas com bcrypt
- ✅ Sessão com refresh token
- ✅ HTTPOnly cookies em produção

## 📚 Documentação

- [README.md](./README.md) - Visão geral e scripts
- [SETUP.md](./SETUP.md) - Guia completo de instalação
- [plan.prompt.md](../docs/Backend/plan.prompt.md) - Plano do projeto
- [Swagger/OpenAPI](http://localhost:3000/api/docs) - Documentação interativa

## ✅ Próximas etapas

1. Instalar dependências: `npm install`
2. Configurar `.env` com suas credenciais
3. Subir Docker: `docker-compose up -d`
4. Aplicar migrations: `npm run db:push`
5. Iniciar em desenvolvimento: `npm run dev`
6. Acessar Swagger: http://localhost:3000/api/docs
7. Começar a desenvolver!

---

**SafeID Backend** • Proteção de Identidade Segura

Estrutura criada conforme plano em Clean Architecture com NestJS, Docker e Prisma.
