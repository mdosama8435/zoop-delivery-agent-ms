import { Router, Request, Response } from 'express';
import { PrismaService } from '../services/prisma.service';
import { CacheService } from '../services/cache.service';
import { ResponseUtil } from '../utils/response.util';
import { HttpStatus } from '../constants/httpStatus';

const router = Router();

router.get('/', async (_req: Request, res: Response): Promise<void> => {
  const dbConnected = await PrismaService.isHealthy();
  const redisConnected = CacheService.isHealthy();

  // 1. Critical Failure: PostgreSQL is down
  if (!dbConnected) {
    ResponseUtil.error(
      res,
      'Core database dependency is currently unreachable',
      HttpStatus.SERVICE_UNAVAILABLE,
      'SERVICE_UNAVAILABLE',
      [{ field: 'database', issue: 'PostgreSQL connection failed' }]
    );
    return;
  }

  // 2. Degraded: PostgreSQL is up, but Redis is down (Fail-open operational mode)
  if (!redisConnected) {
    ResponseUtil.success(
      res,
      {
        status: 'degraded',
        uptime: process.uptime(),
        services: {
          database: 'connected',
          redis: 'disconnected',
        },
        message: 'Redis cache is offline; operating in resilient fail-open mode directly via database.',
      },
      HttpStatus.OK
    );
    return;
  }

  // 3. Fully Healthy: Both PostgreSQL and Redis are active
  ResponseUtil.success(
    res,
    {
      status: 'healthy',
      uptime: process.uptime(),
      services: {
        database: 'connected',
        redis: 'connected',
      },
    },
    HttpStatus.OK
  );
});

export const healthRoutes = router;
