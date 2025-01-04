import {
  ExecutionContext,
  UseGuards,
  applyDecorators,
  createParamDecorator,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { ApiKeyGuard } from './api-key.guard';
import { AuthGuard } from './auth.guard';
import { RequestWithApplication, RequestWithUser } from './auth.type';

export function Auth() {
  return applyDecorators(ApiBearerAuth('Access_Token'), UseGuards(AuthGuard));
}

export function KeyAuth() {
  return applyDecorators(ApiBearerAuth('Api_Key'), UseGuards(ApiKeyGuard));
}

export const GetUser = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    return request.user;
  },
);

export const GetApplication = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<RequestWithApplication>();
    const application = request.application;

    return application;
  },
);
