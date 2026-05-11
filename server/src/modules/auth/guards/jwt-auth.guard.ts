/**
 * JWT Authentication Guard
 * Protege rotas que requerem autenticação via JWT
 */

import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
