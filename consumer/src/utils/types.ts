import { PrismaClient } from '@prisma/client';
import * as runtime from '@prisma/client/runtime/library.js';

export type TX = Omit<PrismaClient, runtime.ITXClientDenyList>;

export type Common<A, B> = {
  [P in keyof A & keyof B]: A[P] | B[P];
};
