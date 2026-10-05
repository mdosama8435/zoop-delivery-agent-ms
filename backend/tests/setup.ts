import { PrismaService } from '../src/services/prisma.service';
import { redisManager } from '../src/config/redis.config';

beforeAll(async () => {
  // Ensure connection is established
  await PrismaService.isHealthy();
});

afterAll(async () => {
  // Cleanly teardown database and cache connections
  await PrismaService.disconnect();
  await redisManager.disconnect();
});
