import request from 'supertest';
import app from '../../src/app';

describe('Integration: Healthcheck API', () => {
  it('GET /api/v1/health should return 200 OK with dependency status', async () => {
    const res = await request(app).get('/api/v1/health');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
    expect(res.body.data.status).toBe('healthy');
    expect(res.body.data.services.database).toBe('connected');
    expect(res.body.data.services.redis).toBe('connected');
    expect(res.headers['x-request-id']).toBeDefined();
  });
});
