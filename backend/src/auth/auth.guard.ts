import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role, ROLES_KEY } from './auth-roles.decorator';
import { AuthService } from './auth.service';
import { RequestWithUserWithRole } from './auth.type';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<Role[] | undefined>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    const request = context
      .switchToHttp()
      .getRequest<RequestWithUserWithRole>();
    const token = this.authService.extractTokenFromHeader(request);
    const user = await this.authService.verifyTokenRemoteAndGetUser(
      token,
      requiredRoles,
    );
    request.user = user;

    return Promise.resolve(true);
  }
}
