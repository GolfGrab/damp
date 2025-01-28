import { Config } from '@/utils/config/config-dto';
import {
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { PrismaService } from 'nestjs-prisma';
import { Client } from 'openid-client';
import { Role } from './auth-roles.decorator';
import { inspect } from 'util';

@Injectable()
export class AuthService {
  constructor(
    private client: Client,
    private prisma: PrismaService,
    private config: Config,
  ) {}

  private readonly logger = new Logger(AuthService.name);

  extractTokenFromHeader(request: FastifyRequest): string {
    if (!request.headers?.authorization) {
      throw new UnauthorizedException();
    }

    const [type, token] = request.headers?.authorization?.split(' ') ?? [];

    if (!type || !token || type !== 'Bearer') {
      throw new UnauthorizedException();
    }
    return token;
  }

  async verifyApiKeyAndGetApplication(key: string) {
    const application = await this.prisma.application.findUnique({
      where: {
        apiKey: key,
      },
    });

    if (!application) {
      throw new UnauthorizedException();
    }

    return application;
  }

  async verifyTokenRemoteAndGetUser(token: string, roles: Role[] | undefined) {
    const result = await this.client.introspect(token);
    if (!result.active) {
      throw new UnauthorizedException();
    }
    if (result.client_id !== this.config.OAUTH_ALLOWED_CLIENT_ID) {
      throw new UnauthorizedException("Client ID doesn't match");
    }

    const userInfo = await this.client.userinfo(token);

    this.logger.log(`User info: ${inspect(userInfo)}`);
    this.logger.log(`Required roles: ${inspect(roles)}`);

    if (roles && roles.length > 0) {
      if (!userInfo.groups) {
        throw new UnauthorizedException("User doesn't have groups");
      }
      const userRoles = userInfo.groups as string[];
      const hasRole = roles.some((role) => userRoles.includes(role));
      if (!hasRole) {
        throw new UnauthorizedException("User doesn't have required role");
      }
    }

    if (!userInfo.email) {
      throw new InternalServerErrorException("userInfo doesn't have email");
    }

    const user = await this.prisma.user.upsert({
      where: {
        id: userInfo.email,
      },
      create: {
        id: userInfo.email,
        email: userInfo.email,
        createdByUserId: this.config.SYSTEM_USER_ID,
        updatedByUserId: this.config.SYSTEM_USER_ID,
      },
      update: {},
    });

    return {
      ...user,
      roles: userInfo.groups as string[],
    };
  }
}
