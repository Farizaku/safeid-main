# 🛠️ Tecnologias e Boas Práticas - SafeID Backend

## 📦 TECNOLOGIAS UTILIZADAS

### 🔧 Runtime & Framework Principal
- **Node.js** 20+ - Runtime JavaScript
- **NestJS** 10.3.0 - Framework full-stack para backend em Node.js
- **Express** 4.18.2 - Servidor HTTP (utilizado pelo NestJS)
- **TypeScript** 5.3.3 - Type-safe JavaScript

### 📊 Banco de Dados
- **Prisma** 5.8.0 - ORM moderna e type-safe
- **PostgreSQL** - Banco de dados relacional
- **Migrations** - Versionamento automático de schema

### 🔐 Segurança & Validação
- **Helmet** 7.1.0 - Proteção de headers HTTP
- **Passport.js** 0.7.0 - Autenticação modular
- **JWT (JSON Web Tokens)** - Via `@nestjs/jwt` 11.0.0
- **bcryptjs** 2.4.3 - Hash de senhas
- **class-validator** 0.14.0 - Validação declarativa de DTOs
- **class-transformer** 0.5.1 - Transformação e serialização de dados

### 🔄 Cache & Sessões
- **Redis** 7+ - Cache em memória
- **ioredis** 5.3.0 - Cliente Redis
- **express-session** 1.17.3 - Gerenciamento de sessões
- **BullMQ** 5.0.0 - Fila de tarefas com Redis

### 🤖 Inteligência Artificial
- **Google Generative AI** 0.7.0 - API Gemini para análise de riscos
- **Opossum** 8.1.0 - Circuit breaker para resiliência

### 📡 HTTP & Integração
- **Axios** 1.6.0 - Cliente HTTP para chamadas externas
- **HIBP Client** - Have I Been Pwned API (detecção de vazamentos)

### 📖 Documentação
- **Swagger/OpenAPI** 7.1.0 - Documentação interativa de API
- **swagger-ui-express** 5.0.0 - UI para documentação

### 🧪 Testes
- **Jest** 29.7.0 - Framework de testes unitários
- **ts-jest** 29.1.1 - Transpilação TypeScript para Jest
- **@nestjs/testing** 10.3.0 - Utilities de teste para NestJS

### 📦 Utilitários
- **compression** 1.7.4 - Compressão de respostas HTTP
- **dotenv** 16.3.1 - Variáveis de ambiente
- **uuid** 9.0.1 - Geração de IDs únicos
- **rxjs** 7.8.1 - Programação reativa (usado pelo NestJS)
- **reflect-metadata** 0.1.13 - Metadata reflection

### 🎨 Code Quality
- **ESLint** 8.55.0 - Linting JavaScript/TypeScript
- **Prettier** 3.1.1 - Formatação automática de código
- **@typescript-eslint** 6.13.0 - Plugin TypeScript para ESLint

### 🐳 DevOps
- **Docker** - Containerização
- **Docker Compose** - Orquestração local
- **GitHub Actions** - CI/CD pipeline

---

## ✅ BOAS PRÁTICAS DE BACKEND IMPLEMENTADAS

### 1. 🏗️ ARQUITETURA (Clean Architecture)
- **Separação em camadas clara:**
  - `api/` - Camada de apresentação (controllers, middlewares, routes)
  - `core/` - Camada de domínio (entities, repositories, use-cases)
  - `infra/` - Camada de infraestrutura (database, cache, http, queue)
  - `shared/` - Recursos compartilhados (utils, crypto, schemas)
  - `modules/` - Módulos de domínio (auth, scan, health)

- **Vantagens:**
  - Independência de frameworks
  - Facilita testes
  - Escalabilidade
  - Manutenibilidade

### 2. 🔒 SEGURANÇA

#### Headers HTTP
```typescript
// Helmet.js - Proteção automática de headers
app.use(helmet());
```
- Desabilita X-Powered-By
- Ativa HSTS
- Content Security Policy
- X-Frame-Options

#### Autenticação
- JWT com expiração (24h)
- Refresh tokens separados
- Session secrets gerados
- Estratégia de senha hash com bcrypt

#### CORS
```typescript
app.enableCors({
  origin: process.env.CORS_ORIGIN,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});
```

#### Validação de Entrada
```typescript
// DTO com class-validator
export class CreateUserDto {
  @IsEmail()
  email: string;

  @MinLength(8)
  @IsStrongPassword()
  password: string;
}

// Global validation pipe
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,           // Remove propriedades não definidas
    forbidNonWhitelisted: true, // Rejeita propriedades extras
    transform: true,           // Transforma tipos automaticamente
  })
);
```

### 3. 🗄️ BANCO DE DADOS

#### ORM Modern (Prisma)
```typescript
// Schema type-safe
model User {
  id        String  @id @default(cuid())
  email     String  @unique
  password  String
  createdAt DateTime @default(now())
}

// Query type-safe
const user = await prisma.user.findUnique({ where: { email } });
```

- Type-safe queries
- Migrations automáticas
- Prisma Studio para debugging
- Relacionamentos automáticos

### 4. 📝 VARIÁVEIS DE AMBIENTE
- ConfigModule global do NestJS
- Arquivo `.env` para desenvolvimento
- `.env.example` versionado
- Suporte a múltiplos ambientes (dev, staging, prod)

### 5. 🧪 TESTES

#### Estrutura
```
tests/
├── unit/        # Testes de unidade
├── integration/ # Testes de integração
└── e2e/         # Testes ponta a ponta
```

#### Jest Configuration
```javascript
// Alias de paths para imports limpos
moduleNameMapper: {
  '^@/(.*)$': '<rootDir>/$1',
  '^@api/(.*)$': '<rootDir>/api/$1',
  '^@core/(.*)$': '<rootDir>/core/$1',
}
```

#### Scripts de Teste
```bash
npm run test          # Executa testes
npm run test:watch   # Watch mode
npm run test:cov     # Cobertura
npm run test:e2e     # Testes ponta a ponta
```

### 6. 🎨 CODE QUALITY

#### ESLint + Prettier
```javascript
// Configuração integrada
// Evita conflicts de estilo
// Formatação automática ao salvar
```

#### TypeScript Strict Mode
```json
{
  "strict": true,
  "noImplicitAny": true,
  "strictNullChecks": true,
  "resolveJsonModule": true
}
```

### 7. 📦 MODULARIZAÇÃO (NestJS Modules)

#### Exemplo: AuthModule
```typescript
@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '24h' }
    }),
    PassportModule,
    DatabaseModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService] // Disponível para outros módulos
})
export class AuthModule {}
```

**Vantagens:**
- Encapsulamento
- Reutilização
- Lazy loading
- Dependências explícitas

### 8. 📡 CONTROLE DE VERSÃO

#### API Versionamento
- Estrutura pronta para múltiplas versões
- Controllers podem ser versionados
- Backward compatibility

### 9. 🚀 PERFORMANCE

#### Compressão
```typescript
app.use(compression());
```

#### Rate Limiting
```javascript
// Configuração em .env
RATE_LIMIT_WINDOW_MS=900000    // 15 minutos
RATE_LIMIT_MAX_REQUESTS=100
```

#### Cache com Redis
- BullMQ para filas
- ioredis para cache
- Session storage em Redis

### 10. 📊 LOGGING & OBSERVABILIDADE

#### Variável LOG_LEVEL
```
LOG_LEVEL=info  # ou debug, error
```

#### NestJS Logger
- Integrado automaticamente
- Diferentes níveis
- Stack traces em erro

### 11. 🏥 HEALTH CHECKS

#### Estrutura Health Module
```typescript
// endpoints para verificação de liveness/readiness
GET /health/live   # Aplicação está rodando
GET /health/ready  # Dependências disponíveis
```

**Uso em Kubernetes:**
```yaml
livenessProbe:
  httpGet:
    path: /health/live
    port: 3000

readinessProbe:
  httpGet:
    path: /health/ready
    port: 3000
```

### 12. 🔄 CIRCUIT BREAKER

#### Opossum Pattern
```typescript
// Proteção para chamadas a APIs externas (HIBP, Gemini)
// Evita cascata de falhas
// Fallback automático
```

### 13. 🐳 CONTAINERIZAÇÃO

#### Multi-stage Dockerfile
```dockerfile
# Build stage
FROM node:20-alpine AS builder

# Production stage (menor imagem)
FROM node:20-alpine
```

#### Docker Compose Local
```yaml
services:
  app:
    build: .
  postgres:
    image: postgres:16
  redis:
    image: redis:7-alpine
```

### 14. 📖 DOCUMENTAÇÃO

#### Swagger OpenAPI
```typescript
// Auto-gerada a partir dos controllers
const config = new DocumentBuilder()
  .setTitle('SafeID API')
  .setVersion('1.0.0')
  .addBearerAuth()
  .build();

const document = SwaggerModule.createDocument(app, config);
SwaggerModule.setup('api/docs', app, document);
```

**Acesso:** `http://localhost:3000/api/docs`

### 15. 🔗 INTEGRAÇÃO COM SERVIÇOS EXTERNOS

#### HIBP (Have I Been Pwned)
- Detecção de vazamentos
- Mock para testes
- Retry automático

#### Google Gemini AI
- Análise de riscos
- Geração de recomendações

### 16. 💾 GESTÃO DE ESTADO

#### Repository Pattern
```typescript
// Interface para abstração
export interface UserRepository {
  findById(id: string): Promise<User>;
  save(user: User): Promise<void>;
}

// Implementação
@Injectable()
export class PrismaUserRepository implements UserRepository {
  // Implementação com Prisma
}
```

**Vantagens:**
- Não acoplado ao framework
- Fácil trocar de BD
- Testável

### 17. 🎯 USE CASES (Camada de Negócio)

#### Clean Architecture - Use Case
```typescript
@Injectable()
export class ExecuteRiskScanUseCase {
  async execute(input: Input): Promise<Output> {
    // Lógica de negócio pura
    // Sem dependência de HTTP, BD, etc
  }
}
```

### 18. 📋 VARIÁVEIS DE AMBIENTE POR CONTEXTO

```bash
# Application
NODE_ENV=development
APP_PORT=3000
APP_URL=http://localhost:3000

# Database
DATABASE_URL=postgresql://user:pass@host/db

# Security
JWT_SECRET=...
REFRESH_TOKEN_SECRET=...
SESSION_SECRET=...

# Integrations
HIBP_API_KEY=...
GOOGLE_GEMINI_API_KEY=...

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS
CORS_ORIGIN=http://localhost:3001
```

### 19. 🔧 CI/CD PIPELINE

#### GitHub Actions (`.github/workflows/ci.yml`)
- Testes automáticos
- Build e push de imagem Docker
- Deploy automático
- Verificações de qualidade

### 20. 📦 VERSIONAMENTO DE DEPENDÊNCIAS

#### Estratégia de Versioning
```json
{
  "dependencies": {
    "@nestjs/common": "^10.3.0"  // Permite patch/minor
  },
  "devDependencies": {
    "typescript": "^5.3.3"        // Fixo para consistência
  }
}
```

---

## 🎯 RESUMO DE BOAS PRÁTICAS

| Prática | Implementação | Benefício |
|---------|---------------|-----------|
| Clean Architecture | Camadas separadas | Manutenibilidade, Escalabilidade |
| Type Safety | TypeScript + Prisma | Menos bugs, melhor DX |
| Validação de Entrada | class-validator | Segurança, Data integrity |
| Segurança | Helmet, JWT, bcrypt | Proteção contra ataques |
| Testes | Jest + múltiplos tipos | Confiança no código |
| Code Quality | ESLint + Prettier | Consistência, Padrão |
| Modularização | NestJS Modules | Reutilização, Encapsulamento |
| Circuit Breaker | Opossum | Resiliência |
| Containerização | Docker | Portabilidade, DevOps |
| Documentação | Swagger | Facilita integração |
| Cache | Redis + BullMQ | Performance |
| Logging | NestJS Logger | Observabilidade |
| Health Checks | /health endpoints | Orquestração de containers |
| Variáveis de Ambiente | .env | Configuração flexível |
| Repository Pattern | Interfaces | Desacoplamento |
| Use Cases | Camada de negócio | Lógica isolada |

---

## 🚀 PRÓXIMAS MELHORIAS RECOMENDADAS

1. **Rate Limiting** - Adicionar middleware de rate limit
2. **Prometheus Metrics** - Monitoramento e observabilidade
3. **Sentry** - Error tracking em produção
4. **Database Transactions** - Garantir ACID
5. **API Versioning** - Versionamento explícito em routes
6. **GraphQL** - Opcionalmente, adicionar GraphQL
7. **Webhooks** - Eventos assíncronos
8. **Audit Logging** - Log de ações de usuários
9. **Database Migrations CI/CD** - Automação
10. **Performance Optimization** - Query optimization, caching strategy

---

**Última atualização:** 12/05/2026
**Projeto:** SafeID - Sistema de Proteção de Identidade
