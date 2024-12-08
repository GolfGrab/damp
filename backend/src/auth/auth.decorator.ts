import {
  ExecutionContext,
  UseGuards,
  applyDecorators,
  createParamDecorator,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { FastifyRequest } from 'fastify';
import { ApiKeyGuard } from './api-key.guard';
import { AuthGuard } from './auth.guard';
import { RequestWithApplication } from './auth.type';

export function Auth() {
  return applyDecorators(ApiBearerAuth('Access Token'), UseGuards(AuthGuard));
}

export function KeyAuth() {
  return applyDecorators(ApiBearerAuth('Api Key'), UseGuards(ApiKeyGuard));
}

export const GetUser = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<FastifyRequest>();
    return null;
  },
);

export const GetApplication = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<RequestWithApplication>();
    const application = request.application;

    return application;
  },
);
