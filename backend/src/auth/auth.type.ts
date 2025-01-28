import { Application } from '@prisma/client';
import { FastifyRequest } from 'fastify';
import { UserWithRoles } from './UserWithRoles';

export interface RequestWithUserWithRole extends FastifyRequest {
  user: UserWithRoles;
}

export interface RequestWithApplication extends FastifyRequest {
  application: Application;
}
