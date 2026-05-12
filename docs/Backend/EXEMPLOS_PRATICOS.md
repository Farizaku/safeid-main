# 💻 EXEMPLOS PRÁTICOS - Implementação de Boas Práticas

## 1. CLEAN ARCHITECTURE - Estrutura em Camadas

### 📂 Estrutura Física
```
src/
├── api/              ← Camada de Apresentação
│   └── controllers/
│       └── scan.controller.ts
│
├── core/             ← Camada de Domínio
│   ├── entities/
│   │   └── scan-result.entity.ts
│   ├── repositories/
│   │   └── scan-history.repository.ts
│   └── use-cases/
│       └── execute-risk-scan.usecase.ts
│
├── infra/            ← Camada de Infraestrutura
│   └── database/
│       └── prisma.service.ts
│
└── shared/           ← Recursos Compartilhados
    └── utils/
```

### 📝 Exemplo Prático

**1. Entity (Camada de Domínio)**
```typescript
// src/core/entities/scan-result.entity.ts
export class ScanResult {
  id: string;
  userId: string;
  riskScore: number;
  findings: Finding[];
  timestamp: Date;

  constructor(data: ScanResultData) {
    this.id = data.id;
    this.userId = data.userId;
    this.riskScore = data.riskScore;
    this.findings = data.findings;
    this.timestamp = data.timestamp;
  }

  // Lógica de negócio pura
  isHighRisk(): boolean {
    return this.riskScore > 70;
  }

  getRecommendations(): string[] {
    return this.findings.map(f => f.recommendation);
  }
}
```

**2. Repository Interface (Contrato)**
```typescript
// src/core/repositories/scan-history.repository.ts
export interface ScanHistoryRepository {
  save(scan: ScanResult): Promise<void>;
  findById(id: string): Promise<ScanResult | null>;
  findByUserId(userId: string): Promise<ScanResult[]>;
}
```

**3. Use Case (Lógica de Negócio)**
```typescript
// src/core/use-cases/execute-risk-scan.usecase.ts
import { Injectable } from '@nestjs/common';
import { ScanResult } from '../entities/scan-result.entity';
import { ScanHistoryRepository } from '../repositories/scan-history.repository';

@Injectable()
export class ExecuteRiskScanUseCase {
  constructor(
    private scanRepository: ScanHistoryRepository,
    private hibpClient: HibpClient,
    private aiEngine: AIEngine,
  ) {}

  async execute(userId: string, email: string): Promise<ScanResult> {
    // Buscar dados de vazamento
    const breaches = await this.hibpClient.checkBreaches(email);

    // Analisar com IA
    const riskAssessment = await this.aiEngine.assessRisk({
      breaches,
      email,
    });

    // Criar entidade
    const scanResult = new ScanResult({
      id: generateId(),
      userId,
      riskScore: riskAssessment.score,
      findings: riskAssessment.findings,
      timestamp: new Date(),
    });

    // Persistir
    await this.scanRepository.save(scanResult);

    return scanResult;
  }
}
```

**4. Controller (Camada de Apresentação)**
```typescript
// src/api/controllers/scan.controller.ts
import { Controller, Post, UseGuards } from '@nestjs/common';
import { ExecuteRiskScanUseCase } from '../../core/use-cases/execute-risk-scan.usecase';
import { CurrentUser } from '../decorators/current-user.decorator';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@Controller('scan')
@UseGuards(JwtAuthGuard)
export class ScanController {
  constructor(private executeRiskScanUseCase: ExecuteRiskScanUseCase) {}

  @Post('execute')
  async execute(@CurrentUser() user: User) {
    const result = await this.executeRiskScanUseCase.execute(
      user.id,
      user.email,
    );
    return {
      status: 'success',
      data: result,
    };
  }
}
```

**5. Prisma Implementation (Infraestrutura)**
```typescript
// src/infra/database/repositories/prisma-scan-history.repository.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { ScanHistoryRepository } from '../../../core/repositories/scan-history.repository';
import { ScanResult } from '../../../core/entities/scan-result.entity';

@Injectable()
export class PrismaScanHistoryRepository implements ScanHistoryRepository {
  constructor(private prisma: PrismaService) {}

  async save(scan: ScanResult): Promise<void> {
    await this.prisma.scanResult.create({
      data: {
        id: scan.id,
        userId: scan.userId,
        riskScore: scan.riskScore,
        findings: scan.findings,
        timestamp: scan.timestamp,
      },
    });
  }

  async findById(id: string): Promise<ScanResult | null> {
    const data = await this.prisma.scanResult.findUnique({
      where: { id },
    });

    if (!data) return null;

    return new ScanResult(data);
  }

  async findByUserId(userId: string): Promise<ScanResult[]> {
    const data = await this.prisma.scanResult.findMany({
      where: { userId },
    });

    return data.map(d => new ScanResult(d));
  }
}
```

---

## 2. VALIDAÇÃO COM DECORADORES

### DTO com class-validator

```typescript
// src/modules/auth/dto/auth.dto.ts
import {
  IsEmail,
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsStrongPassword,
  Matches,
} from 'class-validator';

export class CreateUserDto {
  @IsEmail({}, { message: 'Email deve ser válido' })
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  @MinLength(8, { message: 'Senha deve ter no mínimo 8 caracteres' })
  @IsStrongPassword(
    {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    },
    { message: 'Senha deve ter maiúscula, minúscula, número e símbolo' }
  )
  password: string;

  @Matches(/^[a-zA-Z\s]*$/, { message: 'Nome deve conter apenas letras' })
  @MaxLength(100)
  name: string;
}

export class LoginDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;
}
```

### Global Validation Pipe

```typescript
// src/main.ts
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Validação global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,           // Remove props não definidas
      forbidNonWhitelisted: true, // Rejeita props extras
      transform: true,           // Transforma tipos
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  await app.listen(3000);
}
```

---

## 3. AUTENTICAÇÃO COM JWT

### Strategy JWT

```typescript
// src/modules/auth/strategies/jwt.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { PrismaService } from '../../../infra/database/prisma.service';

interface JwtPayload {
  sub: string;
  email: string;
  iat: number;
  exp: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: JwtPayload) {
    // Validar no banco se o usuário ainda existe
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user) {
      throw new UnauthorizedException('Usuário não encontrado');
    }

    return user; // Será injetado em @CurrentUser()
  }
}
```

### Auth Service

```typescript
// src/modules/auth/auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../infra/database/prisma.service';
import { CreateUserDto, LoginDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(dto: CreateUserDto) {
    // Verificar se usuário já existe
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existing) {
      throw new ConflictException('Email já registrado');
    }

    // Hash da senha
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(dto.password, salt);

    // Criar usuário
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        name: dto.name,
      },
    });

    return this.generateTokens(user);
  }

  async login(dto: LoginDto) {
    // Buscar usuário
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    // Comparar senha
    const passwordMatch = await bcrypt.compare(dto.password, user.password);

    if (!passwordMatch) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    return this.generateTokens(user);
  }

  private generateTokens(user: any) {
    const payload = { sub: user.id, email: user.email };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: '24h',
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.REFRESH_TOKEN_SECRET,
      expiresIn: '7d',
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };
  }
}
```

### Controller Auth

```typescript
// src/modules/auth/auth.controller.ts
import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto, LoginDto } from './dto/auth.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Registrar novo usuário' })
  async register(@Body() dto: CreateUserDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login de usuário' })
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }
}
```

---

## 4. SEGURANÇA COM HELMET

### Configuração em main.ts

```typescript
// src/main.ts
import helmet from 'helmet';
import compression from 'compression';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Helmet - Headers de segurança
  app.use(helmet());

  // Proteções específicas
  app.use(helmet.frameguard({ action: 'deny' }));
  app.use(helmet.hsts({ maxAge: 31536000 }));
  app.use(helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
    },
  }));

  // Compressão
  app.use(compression());

  // CORS
  app.enableCors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3001',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });
}
```

---

## 5. CIRCUIT BREAKER COM OPOSSUM

### Proteção de API Externa

```typescript
// src/infra/http/hibp.client.ts
import * as CircuitBreaker from 'opossum';
import axios from 'axios';

@Injectable()
export class HibpClient {
  private breaker: CircuitBreaker.CircuitBreaker;

  constructor() {
    const options = {
      timeout: 3000,      // Timeout por requisição
      errorThresholdPercentage: 50,
      resetTimeout: 30000, // 30s para tentar novamente
      name: 'HIBP API',
    };

    this.breaker = new CircuitBreaker(
      this.checkBreachesRequest.bind(this),
      options,
    );

    // Fallback em caso de falha
    this.breaker.fallback(() => ({
      breaches: [],
      message: 'HIBP unavailable, returning empty results',
    }));

    // Log de eventos
    this.breaker.on('open', () => {
      console.warn('Circuit breaker OPENED for HIBP API');
    });

    this.breaker.on('halfOpen', () => {
      console.info('Circuit breaker HALF-OPEN for HIBP API');
    });
  }

  async checkBreaches(email: string) {
    try {
      return await this.breaker.fire(email);
    } catch (error) {
      console.error('HIBP check failed:', error);
      return [];
    }
  }

  private async checkBreachesRequest(email: string) {
    const response = await axios.get(
      `${process.env.HIBP_BASE_URL}/breachedaccount`,
      {
        params: { account: email },
        headers: {
          'User-Agent': 'SafeID',
          'x-apikey': process.env.HIBP_API_KEY,
        },
      },
    );

    return response.data;
  }
}
```

---

## 6. HEALTH CHECKS

```typescript
// src/modules/health/health.controller.ts
import { Controller, Get } from '@nestjs/common';
import { HealthService } from './health.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private healthService: HealthService) {}

  @Get('live')
  async liveness() {
    return {
      status: 'alive',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('ready')
  async readiness() {
    const dbHealthy = await this.healthService.checkDatabase();
    const cacheHealthy = await this.healthService.checkCache();

    return {
      status: dbHealthy && cacheHealthy ? 'ready' : 'not-ready',
      checks: {
        database: dbHealthy ? 'ok' : 'failed',
        cache: cacheHealthy ? 'ok' : 'failed',
      },
    };
  }
}
```

---

## 7. TESTES UNITÁRIOS COM JEST

```typescript
// src/modules/auth/auth.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../../infra/database/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
              create: jest.fn(),
            },
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
  });

  describe('login', () => {
    it('should return access token on valid credentials', async () => {
      // Arrange
      const email = 'test@example.com';
      const password = 'password123';
      const hashedPassword = await bcrypt.hash(password, 10);

      const mockUser = {
        id: '1',
        email,
        password: hashedPassword,
        name: 'Test User',
      };

      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser);
      jest.spyOn(jwtService, 'sign').mockReturnValue('token');

      // Act
      const result = await service.login({ email, password });

      // Assert
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email },
      });
    });

    it('should throw on invalid email', async () => {
      // Arrange
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.login({
          email: 'nonexistent@example.com',
          password: 'password123',
        }),
      ).rejects.toThrow('Credenciais inválidas');
    });
  });
});
```

---

## 8. PRISMA ORM - Type Safe Queries

```typescript
// Exemplo de queries type-safe com Prisma

// CREATE
const user = await prisma.user.create({
  data: {
    email: 'user@example.com',
    password: hashedPassword,
    name: 'John Doe',
  },
});

// READ
const user = await prisma.user.findUnique({
  where: { id: userId },
  include: { scans: true }, // Related data
});

// UPDATE
const updated = await prisma.user.update({
  where: { id: userId },
  data: { name: 'New Name' },
});

// DELETE
await prisma.user.delete({
  where: { id: userId },
});

// COMPLEX QUERY
const recentScans = await prisma.scanResult.findMany({
  where: {
    userId,
    timestamp: {
      gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
    },
  },
  orderBy: { timestamp: 'desc' },
  take: 10,
});

// TRANSACTION
await prisma.$transaction([
  prisma.user.update({ where: { id: userId }, data: { status: 'active' } }),
  prisma.auditLog.create({
    data: { userId, action: 'activated' },
  }),
]);
```

---

## 9. ENVIRONMENT VARIABLES

```bash
# .env.example - Versionado no Git
NODE_ENV=development
APP_PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/safeid

# .env - NÃO versionado, local apenas
NODE_ENV=development
APP_PORT=3000
DATABASE_URL=postgresql://safeid_user:SenhaForte2025@localhost:5432/safeid_db
JWT_SECRET=super-secret-key
```

### Uso em Código

```typescript
// config/database.config.ts
import { registerAs } from '@nestjs/config';

export const databaseConfig = registerAs('database', () => ({
  url: process.env.DATABASE_URL,
  logging: process.env.NODE_ENV === 'development',
}));
```

---

## 10. DOCKER COMPOSE - Ambiente Local

```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
      - DATABASE_URL=postgresql://safeid_user:password@postgres:5432/safeid
      - REDIS_URL=redis://redis:6379
    depends_on:
      - postgres
      - redis
    volumes:
      - .:/app
      - /app/node_modules

  postgres:
    image: postgres:16-alpine
    environment:
      - POSTGRES_USER=safeid_user
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=safeid
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

---

Esses exemplos cobrem as principais boas práticas implementadas no SafeID Backend! 🚀
