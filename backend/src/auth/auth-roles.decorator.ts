import { SetMetadata } from '@nestjs/common';

export const enum Role {
  Developer = 'org_developer',
  Admin = 'org_admin',
}

export const ROLES_KEY = 'roles';
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
