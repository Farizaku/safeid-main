/**
 * Development Auth Guard
 * Permite requisições sem autenticação em modo desenvolvimento
 * Retorna usuário fake com ID 1
 */

import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';

@Injectable()
export class DevAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    if (process.env.NODE_ENV !== 'development') {
      return true; // Em produção, usar guard real
    }

    const request = context.switchToHttp().getRequest();

    // Se há token Authorization, deixa passar para outro guard processar
    if (request.headers.authorization) {
      return true;
    }

    // Em dev, cria usuário fake
    request.user = {
      id: 1,
      email: 'dev-test@localhost',
      role: 'user',
    };

    console.log('[DevAuthGuard] Using fake user:', request.user);
    return true;
  }
}
