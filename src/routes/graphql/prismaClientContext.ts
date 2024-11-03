import { PrismaClient } from '@prisma/client';

export interface PrismaClientContext {
    prisma: PrismaClient;
}
