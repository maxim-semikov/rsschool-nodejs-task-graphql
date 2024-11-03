import { PrismaClient } from '@prisma/client';
import { DataLoaderType } from './dataLoader.js';

export interface PrismaClientContext {
  prisma: PrismaClient;
  loader: DataLoaderType;
}
