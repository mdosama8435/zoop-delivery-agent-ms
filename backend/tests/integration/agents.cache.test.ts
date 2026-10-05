import request from 'supertest';
import app from '../../src/app';

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
});
