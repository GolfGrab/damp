import { Config } from '@/utils/config/config-dto';
import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { PrismaService } from 'nestjs-prisma';
import { Client } from 'openid-client';

@Injectable()
export class AuthService {
  constructor(
    private client: Client,
    private prisma: PrismaService,
    private config: Config,
  ) {}

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

  async verifyTokenRemoteAndGetUser(token: string) {
    const result = await this.client.introspect(token);
    if (!result.active) {
      throw new UnauthorizedException();
    }
    if (result.client_id !== this.config.OAUTH_ALLOWED_CLIENT_ID) {
      throw new UnauthorizedException("Client ID doesn't match");
    }
    const user = await this.client.userinfo(token).then((userinfo) => {
      if (!userinfo.email) {
        throw new InternalServerErrorException("Userinfo doesn't have email");
      }
      return this.prisma.user.upsert({
        where: {
          id: userinfo.email,
        },
        create: {
          id: userinfo.email,
        },
        update: {},
      });
    });

    return user;
  }
}
