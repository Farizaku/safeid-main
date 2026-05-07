# Guia de Setup - SafeID Backend

## 📋 Pré-requisitos

- **Node.js 20+** (https://nodejs.org/)
- **npm 10+** ou **yarn 4+**
- **Docker** e **Docker Compose** (para infraestrutura local)
- **PostgreSQL 16+** (se não usar Docker)
- **Redis 7+** (opcional, para cache)

## 🚀 Instalação Local

### 1. Clonar repositório e instalar dependências

```bash
# Entrar na pasta do servidor
cd server

# Instalar dependências
npm install
```

### 2. Configurar variáveis de ambiente

```bash
# Copiar arquivo de exemplo
cp .env.example .env

# Editar com suas configurações
nano .env  # ou seu editor favorito
```

### 3. Subir infraestrutura com Docker

```bash
# Iniciar containers (PostgreSQL + Redis)
docker-compose up -d

# Verificar status
docker-compose ps
```

### 4. Setup do banco de dados

```bash
# Aplicar schema (cria tabelas)
npm run db:push

# Ou criar migration para versionar mudanças
npm run db:migrate

# (Opcional) Explorar dados com Prisma Studio
npm run db:studio
```

### 5. Iniciar servidor

```bash
# Modo desenvolvimento (com auto-reload)
npm run dev

# Modo produção (após build)
npm run build
npm start
```

O servidor estará em **http://localhost:3000**

## 🔗 Endpoints principais

```
POST   /api/auth/login           # Login com email/CPF e senha
POST   /api/auth/logout          # Logout
POST   /api/auth/refresh         # Renovar sessão

GET    /api/usuarios             # Listar usuários
POST   /api/usuarios             # Criar usuário
GET    /api/usuarios/:id         # Obter usuário
PUT    /api/usuarios/:id         # Atualizar usuário
DELETE /api/usuarios/:id         # Desativar usuário

GET    /api/instituicoes         # Listar instituições
POST   /api/instituicoes         # Criar instituição
GET    /api/instituicoes/:id     # Obter instituição
PUT    /api/instituicoes/:id     # Atualizar instituição
DELETE /api/instituicoes/:id     # Desativar instituição

GET    /api/beneficiarios/instituicao/:instituicaoId  # Listar beneficiários
GET    /api/atendimentos         # Listar atendimentos
GET    /api/servicos             # Listar serviços

GET    /api/health               # Status de saúde
```

## 📚 Documentação da API

Acesse **http://localhost:3000/api/docs** para ver a documentação completa do Swagger/OpenAPI

## 🧪 Testes

```bash
# Testes unitários
npm test

# Testes em modo watch
npm test:watch

# Testes com cobertura
npm test:cov

# Testes de integração
npm run test:integration

# Testes E2E
npm run test:e2e
```

## 💻 Desenvolvimento

### Linting e Formatting

```bash
# Verificar estilo do código
npm run lint

# Corrigir automaticamente
npm run lint:fix

# Formatar com Prettier
npm run format
```

### Banco de dados

```bash
# Ver schema atual
npm run db:studio

# Criar nova migration
npm run db:migrate

# Resetar banco de dados (cuidado!)
npx prisma migrate reset
```

## 🐳 Docker

### Build da imagem

```bash
# Build imagem
docker build -t safeid-app:latest .

# Rodar container
docker run -p 3000:3000 --env-file .env safeid-app:latest
```

### Com Docker Compose

```bash
# Subir tudo
docker-compose up

# Em background
docker-compose up -d

# Ver logs
docker-compose logs -f app

# Parar tudo
docker-compose down

# Remover volumes (BD) também
docker-compose down -v
```

## 🔍 Troubleshooting

### Erro: "Database connection failed"

1. Verificar se PostgreSQL está rodando:
   ```bash
   docker-compose ps
   ```

2. Verificar `DATABASE_URL` no `.env`

3. Testar conexão:
   ```bash
   npm run db:push
   ```

### Erro: "Port 3000 already in use"

```bash
# Mudar porta no .env ou usar outra:
APP_PORT=3001
npm run dev

# Ou matar processo usando a porta:
lsof -i :3000
kill -9 <PID>
```

### Erro: "npm install" falha

```bash
# Limpar cache
npm cache clean --force

# Reinstalar
rm -rf node_modules package-lock.json
npm install
```

## 📝 Estrutura de projeto

```
server/
├── src/
│   ├── @types/             # Tipos TypeScript globais
│   ├── api/                # Camada de apresentação
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   └── routes/
│   ├── core/               # Lógica de domínio
│   │   ├── entities/
│   │   ├── repositories/
│   │   └── use-cases/
│   ├── infra/              # Infraestrutura
│   │   ├── database/
│   │   ├── cache/
│   │   └── http/
│   ├── shared/             # Recursos compartilhados
│   │   ├── utils/
│   │   ├── crypto/
│   │   └── schemas/
│   ├── modules/            # Módulos de domínio
│   │   ├── auth/
│   │   ├── usuarios/
│   │   ├── instituicoes/
│   │   └── ...
│   ├── app.module.ts
│   └── main.ts
├── prisma/
│   └── schema.prisma
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── docker-compose.yml
├── Dockerfile
├── .env.example
└── README.md
```

## 🔐 Segurança

- **Nunca** commitar `.env` com segredos reais
- Usar `.env.example` como template
- Em produção, usar variáveis de ambiente do orquestrador (Kubernetes, ECS, etc.)
- Manter dependências atualizadas: `npm outdated`

## 🚀 Próximos passos

1. Implementar testes unitários e de integração
2. Adicionar validações mais complexas
3. Implementar sistema de logs e monitoramento
4. Setup de CI/CD (GitHub Actions, GitLab CI, etc.)
5. Deploy em produção (Docker, Kubernetes, etc.)

## 📞 Suporte

Para dúvidas, consulte:
- [README.md](./README.md)
- [Estrutura do Backend SafeID.pdf](../docs/Backend/Estrutura%20do%20Backend%20SafeID.pdf)
- [Plan do Projeto](../docs/Backend/plan.prompt.md)

---

**SafeID Backend** • Proteção de Identidade Segura
