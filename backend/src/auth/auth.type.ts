import { Application, User } from '@prisma/client';
import { FastifyRequest } from 'fastify';

export interface RequestWithUser extends FastifyRequest {
  user: User;
}

export interface RequestWithApplication extends FastifyRequest {
  application: Application;
}
