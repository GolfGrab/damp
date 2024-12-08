import { CanActivate, ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RequestWithApplication } from './auth.type';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private authService: AuthService) {}

  private readonly logger = new Logger(ApiKeyGuard.name);

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithApplication>();
    const token = this.authService.extractTokenFromHeader(request);
    const application =
      await this.authService.verifyApiKeyAndGetApplication(token);
    request.application = application;

    return true;
  }
}
