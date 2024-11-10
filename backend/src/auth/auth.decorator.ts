import {
  ExecutionContext,
  UseGuards,
  applyDecorators,
  createParamDecorator,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { FastifyRequest } from 'fastify';
import { AuthGuard } from './auth.guard';

export function Auth() {
  return applyDecorators(ApiBearerAuth(), UseGuards(AuthGuard));
}

export const GetUser = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<FastifyRequest>();
    return null;
  },
);
