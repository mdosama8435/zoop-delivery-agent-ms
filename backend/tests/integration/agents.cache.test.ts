import request from 'supertest';
import app from '../../src/app';
import { redisManager } from '../../src/config/redis.config';
import { CacheService } from '../../src/services/cache.service';

describe('Integration: Redis Cache-Aside & Invalidation Verification', () => {
  let agentId: string;
  const uniquePhone = `+919877${Math.floor(100000 + Math.random() * 900000)}`;

  beforeAll(async () => {
    // Create an agent specifically for cache testing
    const res = await request(app)
      .post('/api/v1/agents')
      .send({
        name: 'Cache Test Runner',
        email: `cache.runner.${Date.now()}@zoop.delivery`,
        phone: uniquePhone,
        serviceArea: 'High Tech Cache Zone',
        status: 'ACTIVE',
      });

    agentId = res.body.data.id;
  });

  afterAll(async () => {
    if (agentId) {
      await request(app).delete(`/api/v1/agents/${agentId}`);
    }
  });

  it('Detail Cache: First read should be a Cache MISS, second read should be a Cache HIT', async () => {
    // Call 1: Miss
    const res1 = await request(app).get(`/api/v1/agents/${agentId}`);
    expect(res1.status).toBe(200);
    expect(res1.headers['x-cache']).toBe('MISS');
    expect(res1.body.meta.cached).toBe(false);

    // Call 2: Hit
    const res2 = await request(app).get(`/api/v1/agents/${agentId}`);
    expect(res2.status).toBe(200);
    expect(res2.headers['x-cache']).toBe('HIT');
    expect(res2.body.meta.cached).toBe(true);
    expect(res2.body.data.id).toBe(agentId);
  });

  it('Detail Cache Invalidation: PATCH should evict detail key and bump version', async () => {
    // 1. Mutate
    const patchRes = await request(app)
      .patch(`/api/v1/agents/${agentId}`)
      .send({ serviceArea: 'Mutated Cache Area' });

    expect(patchRes.status).toBe(200);
    expect(patchRes.body.data.serviceArea).toBe('Mutated Cache Area');

    // 2. Next read must be a Cache MISS with the updated data
    const resAfterPatch = await request(app).get(`/api/v1/agents/${agentId}`);
    expect(resAfterPatch.status).toBe(200);
    expect(resAfterPatch.headers['x-cache']).toBe('MISS');
    expect(resAfterPatch.body.meta.cached).toBe(false);
    expect(resAfterPatch.body.data.serviceArea).toBe('Mutated Cache Area');

    // 3. Immediate subsequent read must be a Cache HIT
    const resHitAgain = await request(app).get(`/api/v1/agents/${agentId}`);
    expect(resHitAgain.status).toBe(200);
    expect(resHitAgain.headers['x-cache']).toBe('HIT');
    expect(resHitAgain.body.meta.cached).toBe(true);
  });

  it('List Cache Invalidation: Mutation should bump list version and invalidate list caches', async () => {
    const queryUrl = '/api/v1/agents?page=1&limit=4&sortBy=name&sortOrder=asc';

    // Call 1: Miss
    const listRes1 = await request(app).get(queryUrl);
    expect(listRes1.status).toBe(200);
    expect(listRes1.headers['x-cache']).toBe('MISS');

    // Call 2: Hit
    const listRes2 = await request(app).get(queryUrl);
    expect(listRes2.status).toBe(200);
    expect(listRes2.headers['x-cache']).toBe('HIT');
    expect(listRes2.body.meta.cached).toBe(true);

    // Create a new agent to trigger list version increment
    const newAgent = await request(app)
      .post('/api/v1/agents')
      .send({
        name: 'List Cache Invalidator Agent',
        email: `invalidator.${Date.now()}@zoop.delivery`,
        phone: `+919875${Math.floor(100000 + Math.random() * 900000)}`,
        serviceArea: 'Invalidation Hub',
      });
    expect(newAgent.status).toBe(201);

    // Call 3: Must be MISS because list version incremented!
    const listRes3 = await request(app).get(queryUrl);
    expect(listRes3.status).toBe(200);
    expect(listRes3.headers['x-cache']).toBe('MISS');
    expect(listRes3.body.meta.cached).toBe(false);

    // Clean up created agent
    await request(app).delete(`/api/v1/agents/${newAgent.body.data.id}`);
  });

  it('Delete Invalidation: DELETE must evict detail cache and bump list version', async () => {
    // 1. Create a dedicated agent to delete
    const createRes = await request(app)
      .post('/api/v1/agents')
      .send({
        name: 'Delete Invalidation Target',
        email: `del.inval.${Date.now()}@zoop.delivery`,
        phone: `+919874${Math.floor(100000 + Math.random() * 900000)}`,
        serviceArea: 'Eviction Hub',
      });
    const targetId = createRes.body.data.id;

    // 2. Pre-warm cache for target
    const warmRes = await request(app).get(`/api/v1/agents/${targetId}`);
    expect(warmRes.status).toBe(200);
    const hitRes = await request(app).get(`/api/v1/agents/${targetId}`);
    expect(hitRes.headers['x-cache']).toBe('HIT');

    // 3. Delete target
    const delRes = await request(app).delete(`/api/v1/agents/${targetId}`);
    expect(delRes.status).toBe(204);

    // 4. Subsequent read must return 404 NOT_FOUND (NOT stale cached data)
    const postDelRes = await request(app).get(`/api/v1/agents/${targetId}`);
    expect(postDelRes.status).toBe(404);
    expect(postDelRes.body.error.code).toBe('NOT_FOUND');
  });

  describe('Fail-Open Architecture: Full CRUD resilience when Redis is offline', () => {
    let failOpenAgentId: string;
    const failOpenEmail = `failopen.${Date.now()}@zoop.delivery`;
    const failOpenPhone = `+919873${Math.floor(100000 + Math.random() * 900000)}`;

    let isReadySpy: jest.SpyInstance;

    beforeAll(() => {
      // Simulate Redis being completely offline / unreachable
      isReadySpy = jest.spyOn(redisManager, 'isReady').mockReturnValue(false);
      expect(CacheService.isHealthy()).toBe(false);
    });

    afterAll(() => {
      // Restore Redis connection manager state
      isReadySpy.mockRestore();
    });

    it('CREATE should succeed via PostgreSQL when Redis is down', async () => {
      const res = await request(app)
        .post('/api/v1/agents')
        .send({
          name: 'Resilient FailOpen Agent',
          email: failOpenEmail,
          phone: failOpenPhone,
          serviceArea: 'Resilience Zone',
          status: 'ACTIVE',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBeDefined();
      failOpenAgentId = res.body.data.id;
    });

    it('LIST should serve directly from PostgreSQL without failing', async () => {
      const res = await request(app).get('/api/v1/agents?limit=5');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.headers['x-cache']).toBe('MISS');
      expect(res.body.meta.cached).toBe(false);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('DETAIL read should query PostgreSQL directly when Redis is down', async () => {
      const res = await request(app).get(`/api/v1/agents/${failOpenAgentId}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(failOpenAgentId);
      expect(res.headers['x-cache']).toBe('MISS');
      expect(res.body.meta.cached).toBe(false);
    });

    it('UPDATE should modify PostgreSQL directly when Redis is down', async () => {
      const res = await request(app)
        .patch(`/api/v1/agents/${failOpenAgentId}`)
        .send({ serviceArea: 'Updated Under FailOpen' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.serviceArea).toBe('Updated Under FailOpen');
    });

    it('DELETE should delete from PostgreSQL cleanly when Redis is down', async () => {
      const res = await request(app).delete(`/api/v1/agents/${failOpenAgentId}`);
      expect(res.status).toBe(204);

      const confirmRes = await request(app).get(`/api/v1/agents/${failOpenAgentId}`);
      expect(confirmRes.status).toBe(404);
    });
  });
});
