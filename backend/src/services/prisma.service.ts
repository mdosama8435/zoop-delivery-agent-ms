import { PrismaClient } from '@prisma/client';
import { env } from '../config/env.config';

class PrismaService {
  private static instance: PrismaClient | null = null;

  public static getClient(): PrismaClient {
    if (!PrismaService.instance) {
      PrismaService.instance = new PrismaClient({
        datasources: {
          db: {
            url: env.DATABASE_URL,
          },
        },
        log: env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
      });
    }
    return PrismaService.instance;
  }

  public static async isHealthy(): Promise<boolean> {
    try {
      const client = PrismaService.getClient();
      await client.$queryRaw`SELECT 1`;
      return true;
    } catch (err) {
      console.error('[PrismaService.isHealthy ERROR]:', err);
      return false;
    }
  }

  public static async disconnect(): Promise<void> {
    if (PrismaService.instance) {
      await PrismaService.instance.$disconnect();
      PrismaService.instance = null;
      console.log('[Prisma] Disconnected cleanly from PostgreSQL');
    }
  }
}

export const prisma = PrismaService.getClient();
export { PrismaService };
