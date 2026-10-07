import request from 'supertest';
import app from '../../src/app';
import { redisManager } from '../../src/config/redis.config';
import { PrismaService } from '../../src/services/prisma.service';

describe('Integration: Healthcheck API', () => {
  it('GET /api/v1/health should return 200 OK when both PostgreSQL and Redis are active', async () => {
    const res = await request(app).get('/api/v1/health');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
    expect(res.body.data.status).toBe('healthy');
    expect(res.body.data.services.database).toBe('connected');
    expect(res.body.data.services.redis).toBe('connected');
    expect(res.headers['x-request-id']).toBeDefined();
  });

  it('GET /api/v1/health should return 200 OK with degraded status when Redis is offline', async () => {
    const isReadySpy = jest.spyOn(redisManager, 'isReady').mockReturnValue(false);

    const res = await request(app).get('/api/v1/health');

    isReadySpy.mockRestore();

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('degraded');
    expect(res.body.data.services.database).toBe('connected');
    expect(res.body.data.services.redis).toBe('disconnected');
    expect(res.body.data.message).toContain('fail-open');
  });

  it('GET /api/v1/health should return 503 Service Unavailable when PostgreSQL is down', async () => {
    const isHealthySpy = jest.spyOn(PrismaService, 'isHealthy').mockResolvedValue(false);

    const res = await request(app).get('/api/v1/health');

    isHealthySpy.mockRestore();

    expect(res.status).toBe(503);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('SERVICE_UNAVAILABLE');
    expect(res.body.error.message).toContain('database');
  });
});
