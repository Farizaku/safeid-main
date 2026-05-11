import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    // Se data especifica um campo, retorna apenas esse campo
    // Se não especifica, retorna o usuário completo (JwtPayload)
    return data ? user?.[data] : user;
  },
);

