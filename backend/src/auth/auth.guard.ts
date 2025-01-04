import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RequestWithUser } from './auth.type';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const token = this.authService.extractTokenFromHeader(request);
    const user = await this.authService.verifyTokenRemoteAndGetUser(token);
    request.user = user;

    return Promise.resolve(true);
  }
}
