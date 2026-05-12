/**
 * Authentication Service
 * Gerencia signup, login, valida��o de credentials
 */

import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../infra/database/prisma.service';
import { ScanService } from '../scan/services/scan.service';
import {
  SignupDto,
  LoginDto,
  AuthResponseDto,
  JwtPayload,
  AuthUserDto,
  ScanSnapshotDto,
} from './dto/auth.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private scanService: ScanService,
  ) {}

  /**
   * Registra novo usu�rio
   * Valida email, hash password, cria usu�rio
   */
  async signup(dto: SignupDto): Promise<AuthResponseDto> {
    // Validar email
    if (!dto.email || !dto.email.includes('@')) {
      throw new BadRequestException('Email inv�lido');
    }

    // Validar password (m�nimo 8 caracteres)
    if (!dto.password || dto.password.length < 8) {
      throw new BadRequestException(
        'Senha deve ter no m�nimo 8 caracteres',
      );
    }

    // Verificar se email j� existe
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (existingUser) {
      throw new ConflictException('Email j� registrado');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(dto.password, 10);

    // Criar usu�rio
    const user = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase(),
        passwordHash,
      },
    });

    let scanFailure: unknown = null;
    try {
      await this.scanService.submitScan(user.id, { email: user.email });
    } catch (error) {
      scanFailure = error;
      console.error('[AuthService] Initial scan failed:', error);
      await this.scanService.persistFallbackSnapshot(user.id, user.email);
    }

    // Gerar tokens
    const tokens = this.generateTokens(user.id, user.email);

    const profile = await this.getUserProfile(user.id);

    if (scanFailure) {
      console.warn('[AuthService] Returning account without scan snapshot because the initial scan failed.');
    }

    return {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      user: profile,
    };
  }

  /**
   * Login de usu�rio
   * Valida credentials, gera JWT
   */
  async login(dto: LoginDto): Promise<AuthResponseDto> {
    if (!dto.email || !dto.password) {
      throw new BadRequestException('Email e senha s�o obrigat�rios');
    }

    // Buscar usu�rio
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (!user) {
      throw new UnauthorizedException('Email ou senha inv�lidos');
    }

    // Validar password
    const isPasswordValid = await bcrypt.compare(
      dto.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Email ou senha inv�lidos');
    }

    // Gerar tokens
    const tokens = this.generateTokens(user.id, user.email);

    const profile = await this.getUserProfile(user.id);

    return {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      user: profile,
    };
  }

  /**
   * Valida JWT e retorna payload
   * Usado por JwtStrategy
   */
  async validateJwt(payload: JwtPayload) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user) {
      throw new UnauthorizedException('Usu�rio n�o encontrado');
    }

    return { id: user.id, email: user.email };
  }

  async getUserProfile(userId: number): Promise<AuthUserDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        scanSnapshot: true,
        scanSnapshotUpdatedAt: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Usuário não encontrado');
    }

    return {
      id: user.id,
      email: user.email,
      scanSnapshot: user.scanSnapshot as ScanSnapshotDto | null,
      scanSnapshotUpdatedAt: user.scanSnapshotUpdatedAt,
    };
  }

  /**
   * Gera access_token e refresh_token
   */
  private generateTokens(userId: number, email: string) {
    const payload = { sub: userId, email };

    const access_token = this.jwtService.sign(payload, {
      expiresIn: (process.env.JWT_EXPIRES_IN as any) || '24h',
    });

    const refresh_token = this.jwtService.sign(payload, {
      expiresIn: (process.env.REFRESH_TOKEN_EXPIRES_IN as any) || '7d',
      secret: process.env.REFRESH_TOKEN_SECRET,
    });

    return { access_token, refresh_token };
  }
}
