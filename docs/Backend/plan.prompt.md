## Plan: Backend SafeID

Criar a base do backend em `server` como uma API REST em Node.js + NestJS, com documentação OpenAPI/Swagger, alinhada aos tópicos estruturais extraídos do documento de backend: Clean Architecture, camadas `api/core/infra/shared`, persistência com Prisma, observabilidade, QA/CI/CD e Docker. A autenticação será por sessão com refresh token, e a configuração local usará `.env` e Docker. Como a pasta `server` está vazia, o trabalho é greenfield; o foco é montar fundação, organização e contratos de API antes de qualquer frontend.

**Tópicos extraídos do documento**
- Clean Architecture como base arquitetural.
- Camada `api` com controllers, middlewares e routes.
- Camada `core` com entities, repositories e use-cases.
- Camada `infra` com database, cache, http e queue.
- Camada `shared` com utils, crypto e schemas.
- Persistência com Prisma e migrations.
- Observabilidade com logs JSON e health checks.
- QA com testes unitários, integração e e2e.
- CI/CD com lint, build e cobertura mínima.
- Docker multi-stage e `docker-compose.yml`.

**Steps**
1. Definir a espinha dorsal do backend *depende de alinhamento técnico já feito*.
   - Criar a estrutura inicial do projeto em `server` com configuração de ambiente, scripts, dependências e convenções de código.
   - Padronizar variáveis de ambiente para persistência, autenticação por sessão, porta e documentação da API.
   - Separar a arquitetura em `api`, `core`, `infra` e `shared`, seguindo a linha do documento.

2. Montar a camada de segurança e autenticação *depende do passo 1*.
   - Implementar sessão com refresh token como estratégia principal de autenticação.
   - Adicionar proteção de borda com Helmet, rate limit e tratamento centralizado de erros.
   - Preparar validação e sanitização de entradas com schemas consistentes.

3. Estruturar a camada de domínio *pode iniciar em paralelo após o passo 1, mas a integração final depende do passo 2*.
   - Criar módulos para `auth`, `usuarios`, `instituicoes`, `beneficiarios`, `atendimentos` e `servicos`.
   - Para cada módulo, separar rotas, controller, service, repository e schemas de validação.
   - Reaproveitar os nomes e relações do objetivo funcional do projeto para manter a API alinhada ao domínio em português.

4. Montar a infraestrutura de persistência e integrações *depende dos passos 1 e 3*.
   - Definir a persistência com Prisma e migrations, usando o banco definido pelo projeto.
   - Estruturar módulos de acesso a dados, cache e integrações externas de forma desacoplada.
   - Preparar suporte para criptografia, logs e contratos de integração, caso o escopo evolua para filas ou serviços externos.

5. Definir os contratos da API *depende dos passos 2 e 3*.
   - Mapear endpoints REST para login, cadastro e consulta das entidades principais.
   - Incluir paginação, filtros e retornos previsíveis para listar e detalhar registros.
   - Publicar Swagger/OpenAPI com exemplos mínimos para o frontend consumir depois.

6. Consolidar observabilidade e saúde do sistema *depende do passo 4*.
   - Implementar logs estruturados em JSON.
   - Criar endpoints de health check para liveness e readiness.
   - Garantir que falhas de infraestrutura sejam tratadas sem expor segredos.

7. Fechar a base de qualidade e entrega *depende da integração dos módulos anteriores*.
   - Adicionar testes unitários, integração e e2e para os fluxos principais.
   - Incluir lint, build e cobertura mínima em pipeline de CI/CD.
   - Adicionar Dockerfile multi-stage, `docker-compose.yml` e arquivo `.env.example`.

**Relevant files**
- `c:\Users\lucas\Documentos\safeid-main\server` — raiz do backend onde a estrutura será criada.
- `c:\Users\lucas\Documentos\safeid-main\docs\Backend\Estrutura do Backend SafeID.pdf` — documento de referência da estrutura desejada.
- `c:\Users\lucas\Documentos\safeid-main\docs\safeid_projeto.docx` — objetivo geral do projeto, usado como guia funcional.

**Verification**
1. Confirmar que o backend inicia localmente sem erro e expõe uma rota de saúde.
2. Validar a geração da documentação Swagger/OpenAPI.
3. Validar a integração com a camada de persistência escolhida para o projeto.
4. Exercitar um fluxo mínimo de autenticação com sessão e refresh token.
5. Conferir que a estrutura criada cobre os tópicos do documento e roda via Docker.

**Decisions**
- Stack definida: Node.js com NestJS.
- Autenticação definida: sessão com refresh token.
- Configuração local definida: `.env` e Docker.
- Tipo de API definido: REST com Swagger/OpenAPI.
- O backend será tratado como implementação greenfield dentro de `server`.
- A pasta `database` não será usada como base de decisão.
- O frontend fica fora de escopo nesta etapa.

**Further Considerations**
1. Se você quiser fidelidade máxima ao PDF, o próximo passo ideal é transformar os tópicos acima em módulos e pastas concretas do NestJS.
2. Se o projeto precisar de cache, filas ou integrações externas, essas camadas podem entrar depois sem quebrar a separação proposta.
3. Se houver interesse, o próximo refinamento pode ser um esqueleto de projeto NestJS com `app.module`, módulos de domínio e configuração de `docker-compose`.
