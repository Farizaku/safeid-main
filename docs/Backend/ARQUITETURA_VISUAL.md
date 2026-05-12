# 🎨 ARQUITETURA VISUAL - Stack SafeID

## 🏗️ STACK TECHNOLÓGICO EM CAMADAS

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (React)                            │
│                                                                   │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTP REST + Websockets
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                   NestJS Framework (Node.js)                     │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  CAMADA DE APRESENTAÇÃO (API)                           │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐       │   │
│  │  │ Controllers│  │ Middlewares│  │  Routes   │       │   │
│  │  │   (REST)   │  │  (Auth,    │  │ (HTTP)    │       │   │
│  │  │            │  │ Helmet)    │  │           │       │   │
│  │  └────────────┘  └────────────┘  └────────────┘       │   │
│  └──────────────────────────────────────────────────────────┘   │
│                             ▼                                    │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  CAMADA DE DOMÍNIO (Business Logic)                     │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐       │   │
│  │  │   Entities │  │ Repositories│ │  Use Cases │       │   │
│  │  │  (Models)  │  │ (Interfaces)│ │(Orquestração)     │   │
│  │  └────────────┘  └────────────┘  └────────────┘       │   │
│  └──────────────────────────────────────────────────────────┘   │
│                             ▼                                    │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  CAMADA DE INFRAESTRUTURA                               │   │
│  │  ┌─────────────┐ ┌──────────┐ ┌────────────────────┐  │   │
│  │  │  Database   │ │  Cache   │ │ HTTP Clients       │  │   │
│  │  │ (Prisma)    │ │(Redis)   │ │ (Axios, Circuit   │  │   │
│  │  │ PostgreSQL  │ │ BullMQ   │ │  Breaker)          │  │   │
│  │  └─────────────┘ └──────────┘ └────────────────────┘  │   │
│  └──────────────────────────────────────────────────────────┘   │
│                             ▼                                    │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  CAMADA COMPARTILHADA (Utils)                           │   │
│  │  ┌─────────┐  ┌─────────┐  ┌──────────┐              │   │
│  │  │Validators│ │ Crypto  │  │ Schemas  │              │   │
│  │  │(class-v) │ │(Utils)  │  │(DTO)     │              │   │
│  │  └─────────┘  └─────────┘  └──────────┘              │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                             │
         ┌───────────────────┼───────────────────┐
         ▼                   ▼                   ▼
    ┌──────────┐        ┌──────────┐        ┌──────────┐
    │PostgreSQL│        │  Redis   │        │ External │
    │Database  │        │Cache/Q   │        │   APIs   │
    │          │        │          │        │(HIBP,AI) │
    └──────────┘        └──────────┘        └──────────┘
```

---

## 📦 ÁRVORE DE DEPENDÊNCIAS

```
SafeID Backend
│
├── 🔧 RUNTIME & BUILD
│   ├── Node.js 20+
│   ├── TypeScript 5.3.3
│   └── nest-cli 10.3.0
│
├── 🎨 FRAMEWORK PRINCIPAL
│   ├── @nestjs/core 10.3.0
│   ├── @nestjs/common 10.3.0
│   ├── @nestjs/platform-express 10.3.0
│   └── Express 4.18.2 (runtime)
│
├── 🗄️ PERSISTÊNCIA
│   ├── Prisma 5.8.0
│   │   ├── @prisma/client
│   │   └── Schema (PostgreSQL)
│   └── PostgreSQL 16+
│
├── 🔐 AUTENTICAÇÃO & SEGURANÇA
│   ├── @nestjs/jwt 11.0.0
│   ├── @nestjs/passport 10.0.0
│   ├── passport 0.7.0
│   │   ├── passport-jwt 4.0.1
│   │   └── passport-local 1.0.0
│   ├── bcryptjs 2.4.3
│   ├── helmet 7.1.0
│   └── express-session 1.17.3
│
├── ✔️ VALIDAÇÃO
│   ├── class-validator 0.14.0
│   └── class-transformer 0.5.1
│
├── 💾 CACHE & FILAS
│   ├── ioredis 5.3.0
│   │   └── Redis 7+
│   └── bullmq 5.0.0
│
├── 📡 INTEGRAÇÃO EXTERNA
│   ├── axios 1.6.0
│   ├── @google/generative-ai 0.7.0
│   └── opossum 8.1.0 (circuit breaker)
│
├── 📚 DOCUMENTAÇÃO
│   ├── @nestjs/swagger 7.1.0
│   └── swagger-ui-express 5.0.0
│
├── 🧪 TESTES (devDependencies)
│   ├── jest 29.7.0
│   ├── ts-jest 29.1.1
│   └── @nestjs/testing 10.3.0
│
├── 🎨 CODE QUALITY (devDependencies)
│   ├── eslint 8.55.0
│   │   └── @typescript-eslint/eslint-plugin 6.13.0
│   ├── prettier 3.1.1
│   └── typescript 5.3.3
│
├── 🌍 CONFIGURATION
│   ├── @nestjs/config 3.1.0
│   ├── dotenv 16.3.1
│   └── reflect-metadata 0.1.13
│
├── ⚙️ UTILIDADES
│   ├── uuid 9.0.1
│   ├── rxjs 7.8.1
│   ├── compression 1.7.4
│   └── @types/* (TypeScript types)
│
└── 🐳 DEVOPS
    ├── Docker
    ├── Docker Compose
    └── GitHub Actions (.github/workflows/ci.yml)
```

---

## 🔄 FLUXO DE DADOS

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER REQUEST                              │
│                    GET /api/scan/execute                         │
│                    Authorization: Bearer JWT                     │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                   HELMET MIDDLEWARE                              │
│           (Proteção de Headers HTTP)                            │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                   CORS MIDDLEWARE                                │
│          (Validação de Origin)                                  │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                JWT AUTHENTICATION GUARD                          │
│         (Passport JWT Strategy)                                 │
│    ✓ Valida token                                               │
│    ✓ Injeta @CurrentUser()                                      │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                  SCAN CONTROLLER                                 │
│         @Post('execute')                                        │
│    Recebe request validado                                      │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│            ExecuteRiskScanUseCase                                │
│    (Lógica de negócio pura)                                     │
│    1. Validar entrada                                           │
│    2. Chamar repositórios                                       │
│    3. Orquestrar fluxo                                          │
└────────────────────────────┬────────────────────────────────────┘
                 ┌───────────┼───────────┐
                 │           │           │
                 ▼           ▼           ▼
    ┌──────────────────┐ ┌──────────┐ ┌──────────┐
    │HIBP Repository   │ │ AI Engine│ │ Scan Repo│
    │(Circuit Breaker) │ │(Gemini)  │ │(Prisma)  │
    └────────┬─────────┘ └────┬─────┘ └────┬─────┘
             │                │            │
             ▼                ▼            ▼
    ┌──────────────────┐ ┌──────────┐ ┌──────────────┐
    │ HIBP API         │ │ Gemini   │ │ PostgreSQL   │
    │(External)        │ │ API      │ │ (Prisma)     │
    └────────┬─────────┘ └────┬─────┘ └──────────────┘
             │                │            │
             └────────────────┼────────────┘
                              │
                              ▼
    ┌──────────────────────────────────────────┐
    │  ScanResult Entity                       │
    │  ┌────────────────────────────────────┐  │
    │  │ {                                  │  │
    │  │   id: UUID,                        │  │
    │  │   userId: string,                  │  │
    │  │   riskScore: number,               │  │
    │  │   findings: Finding[],             │  │
    │  │   timestamp: Date                  │  │
    │  │ }                                  │  │
    │  └────────────────────────────────────┘  │
    └────────────┬─────────────────────────────┘
                 │
                 ▼
    ┌──────────────────────────────────────────┐
    │  JSON Response                           │
    │  HTTP 200 OK                             │
    │  {                                       │
    │    status: 'success',                    │
    │    data: { ScanResult }                  │
    │  }                                       │
    └──────────────────────────────────────────┘
```

---

## 🔐 SEGURANÇA EM PROFUNDIDADE

```
┌─────────────────────────────────────────────────────────────────┐
│                    REQUEST INCOMING                              │
└────────────────────────────┬────────────────────────────────────┘
                             │
                    LAYER 1: Headers
                             ▼
┌────────────────────────────────────────────────────────────────┐
│ HELMET                                                          │
│ • X-Content-Type-Options: nosniff                              │
│ • X-Frame-Options: DENY                                        │
│ • X-XSS-Protection: 1; mode=block                              │
│ • Strict-Transport-Security (HSTS)                             │
│ • Content-Security-Policy                                      │
└────────────────────────────┬────────────────────────────────────┘
                             │
                    LAYER 2: Origin
                             ▼
┌────────────────────────────────────────────────────────────────┐
│ CORS                                                            │
│ • Valida Origin                                                │
│ • Verifica Methods (GET, POST, etc)                            │
│ • Valida Headers (Authorization)                               │
│ • Verifica Credentials                                         │
└────────────────────────────┬────────────────────────────────────┘
                             │
                    LAYER 3: Authentication
                             ▼
┌────────────────────────────────────────────────────────────────┐
│ JWT GUARD                                                       │
│ • Extrai token do header                                       │
│ • Verifica assinatura                                          │
│ • Valida expiração                                             │
│ • Busca usuário no banco                                       │
│ • Injeta @CurrentUser()                                        │
└────────────────────────────┬────────────────────────────────────┘
                             │
                    LAYER 4: Input Validation
                             ▼
┌────────────────────────────────────────────────────────────────┐
│ VALIDATION PIPE                                                 │
│ • class-validator                                              │
│ • Whitelist (remove props extras)                              │
│ • Transform types                                              │
│ • Rejeita payload inválido                                     │
│ • Retorna 400 Bad Request                                      │
└────────────────────────────┬────────────────────────────────────┘
                             │
                    LAYER 5: Business Logic
                             ▼
┌────────────────────────────────────────────────────────────────┐
│ USE CASE                                                        │
│ • Autorização adicional                                        │
│ • Regras de negócio                                            │
│ • Rate limiting (opcional)                                     │
│ • Logging de ações                                             │
└────────────────────────────┬────────────────────────────────────┘
                             │
                    LAYER 6: Data Storage
                             ▼
┌────────────────────────────────────────────────────────────────┐
│ DATABASE (PostgreSQL)                                           │
│ • Prepared statements (SQL Injection)                          │
│ • Row-level security (futuro)                                  │
│ • Encrypted sensitive data                                     │
│ • Audit logs                                                   │
└────────────────────────────────────────────────────────────────┘
```

---

## 🧪 ESTRATÉGIA DE TESTES

```
Application Code (src/)
│
├─ Unit Tests (tests/unit/)
│  ├─ Services (50% coverage)
│  ├─ Utils (80% coverage)
│  └─ Guards (70% coverage)
│  └─ Tempo: ~10s / Total: 30% code
│
├─ Integration Tests (tests/integration/)
│  ├─ Database interactions
│  ├─ API endpoints
│  └─ External service mocks (Axios + Nock)
│  └─ Tempo: ~30s / Total: 40% code
│
└─ E2E Tests (tests/e2e/)
   ├─ Auth flow
   ├─ Full user journeys
   └─ All modules together
   └─ Tempo: ~60s / Total: 60% code

Total Coverage Target: > 80%
```

---

## 📊 MÓDULOS DO NESTJS

```
AppModule (Root)
│
├── ConfigModule (Global)
│   └── .env variables
│
├── DatabaseModule
│   └── PrismaService
│
├── CacheModule
│   └── Redis Connection
│
├── QueueModule
│   └── BullMQ Setup
│
├── AuthModule
│   ├── AuthController
│   ├── AuthService
│   ├── JwtStrategy
│   ├── JwtAuthGuard
│   └── UserService
│
├── ScanModule
│   ├── ScanController
│   ├── ScanService
│   ├── ExecuteRiskScanUseCase
│   ├── ScanRepository
│   └── AIEngine
│
└── HealthModule
    ├── HealthController
    ├── HealthService
    └── /health/* endpoints
```

---

## 🔀 PADRÕES DE DESIGN IMPLEMENTADOS

```
1. MVC (Model-View-Controller)
   Controller → Service → Repository → Database

2. Repository Pattern
   Abstração de dados via interfaces

3. Use Case Pattern
   Lógica de negócio isolada

4. Dependency Injection
   NestJS fornecedor de dependências

5. Strategy Pattern
   JWT Strategy para Passport

6. Factory Pattern
   NestJS Module factory

7. Decorator Pattern
   @CurrentUser() @IsEmail() @Post()

8. Guard Pattern
   JwtAuthGuard para proteção

9. Middleware Pattern
   Helmet, CORS, Compression

10. Circuit Breaker Pattern
    Opossum para resilência
```

---

## 📈 ESCALABILIDADE HORIZONTAL

```
┌─────────────────────────────────────────────┐
│          Load Balancer (Nginx)              │
│         (Não implementado)                  │
└────────────┬────────────────────────────────┘
             │
   ┌─────────┼─────────┐
   ▼         ▼         ▼
┌──────┐ ┌──────┐ ┌──────┐
│ App1 │ │ App2 │ │ App3 │
│:3000 │ │:3001 │ │:3002 │
└──┬───┘ └───┬──┘ └───┬──┘
   └─────────┼────────┘
             │
   ┌─────────┴──────────┐
   ▼                    ▼
┌──────────────┐ ┌──────────────┐
│ PostgreSQL   │ │  Redis       │
│ (Replica)    │ │  (Cluster)   │
│ (Nenhum)     │ │  (Nenhum)    │
└──────────────┘ └──────────────┘
```

---

## 🚀 PIPELINE CI/CD

```
Developer Push
     │
     ▼
GitHub Actions (.github/workflows/ci.yml)
     │
     ├─ npm install
     │
     ├─ npm run lint
     │  └─ ESLint check
     │
     ├─ npm run test
     │  ├─ Unit tests
     │  └─ Integration tests
     │
     ├─ npm run build
     │  └─ TypeScript compilation
     │
     └─ Docker build & push
        └─ Only on main branch
```

---

## 📋 COMPARAÇÃO: SafeID vs Alternativas

```
                   SafeID    Express   FastAPI   Rust
Framework          NestJS    Express   FastAPI   Actix
Language           TS        JS        Python    Rust
Type Safety        ✓✓        ✗         △         ✓✓
Learning Curve     Medium    Easy      Medium    Hard
Productivity       High      Medium    High      Low
Performance        Good      Excellent Excellent  Excellent
Community          Large     Largest   Growing   Small
DevOps Maturity    High      High      Growing   Growing
Ecosystem          Rich      Richest   Rich      Growing

Winner for SafeID: NestJS (Balance)
```

---

**Atualizado:** 12/05/2026 | **Versão:** 1.0
