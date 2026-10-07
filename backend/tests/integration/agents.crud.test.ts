import request from 'supertest';
import app from '../../src/app';
import { prisma } from '../../src/services/prisma.service';

describe('Integration: Delivery Agents CRUD Lifecycle', () => {
  let createdAgentId: string;
  const testEmail = `test.agent.${Date.now()}@zoop.delivery`;
  const testPhone = `+91998877${Math.floor(1000 + Math.random() * 9000)}`;

  it('POST /api/v1/agents should create an agent successfully (201 Created)', async () => {
    const payload = {
      name: 'Integration Test Agent',
      email: testEmail,
      phone: testPhone,
      serviceArea: 'Test Logistics Hub',
      status: 'ACTIVE',
    };

    const res = await request(app)
      .post('/api/v1/agents')
      .send(payload);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBeDefined();
    expect(res.body.data.name).toBe(payload.name);
    expect(res.body.data.email).toBe(payload.email);
    expect(res.body.data.phone).toBe(payload.phone);
    expect(res.headers.location).toContain(res.body.data.id);

    createdAgentId = res.body.data.id;
  });

  it('POST /api/v1/agents should reject duplicate email with 409 Conflict', async () => {
    const payload = {
      name: 'Duplicate Email Agent',
      email: testEmail, // duplicate
      phone: `+91998877${Math.floor(1000 + Math.random() * 9000)}`,
      serviceArea: 'Different Area',
    };

    const res = await request(app)
      .post('/api/v1/agents')
      .send(payload);

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('CONFLICT');
    expect(res.body.error.message).toContain('email');
  });

  it('POST /api/v1/agents should reject duplicate phone with 409 Conflict', async () => {
    const payload = {
      name: 'Duplicate Phone Agent',
      email: `other.email.${Date.now()}@zoop.delivery`,
      phone: testPhone, // duplicate
      serviceArea: 'Different Area',
    };

    const res = await request(app)
      .post('/api/v1/agents')
      .send(payload);

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('CONFLICT');
    expect(res.body.error.message).toContain('phone');
  });

  it('POST /api/v1/agents should reject malformed payload with 400 Bad Request', async () => {
    const payload = {
      name: 'Bad Agent',
      email: 'not-an-email',
      phone: '123',
    };

    const res = await request(app)
      .post('/api/v1/agents')
      .send(payload);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_FAILED');
  });

  it('POST /api/v1/agents should reject malformed JSON string with 400 Bad Request', async () => {
    const res = await request(app)
      .post('/api/v1/agents')
      .set('Content-Type', 'application/json')
      .send('{"name": "Broken JSON", invalid}');

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('MALFORMED_JSON');
  });

  it('GET /api/v1/agents should return paginated list (200 OK)', async () => {
    const res = await request(app)
      .get('/api/v1/agents?page=1&limit=5');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeLessThanOrEqual(5);
    expect(res.body.meta.pagination).toBeDefined();
    expect(res.body.meta.pagination.totalRecords).toBeGreaterThan(0);
  });

  it('GET /api/v1/agents/:id should return agent detail for existing ID', async () => {
    const res = await request(app)
      .get(`/api/v1/agents/${createdAgentId}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(createdAgentId);
    expect(res.body.data.email).toBe(testEmail);
  });

  it('GET /api/v1/agents/:id should return 404 for non-existent UUID', async () => {
    const fakeUuid = '00000000-0000-0000-0000-000000000000';
    const res = await request(app)
      .get(`/api/v1/agents/${fakeUuid}`);

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('GET /api/v1/agents/:id should return 400 for invalid UUID format', async () => {
    const invalidId = 'not-a-valid-uuid';
    const res = await request(app)
      .get(`/api/v1/agents/${invalidId}`);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_FAILED');
  });

  it('PATCH /api/v1/agents/:id should partially update agent (200 OK)', async () => {
    const patchPayload = {
      status: 'INACTIVE',
      serviceArea: 'Updated Airport Logistics Hub',
    };

    const res = await request(app)
      .patch(`/api/v1/agents/${createdAgentId}`)
      .send(patchPayload);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('INACTIVE');
    expect(res.body.data.serviceArea).toBe(patchPayload.serviceArea);
  });

  it('PATCH /api/v1/agents/:id should reject update with email collision with 409 Conflict', async () => {
    // Create a second agent
    const secondAgent = await request(app)
      .post('/api/v1/agents')
      .send({
        name: 'Second Agent for Conflict',
        email: `second.${Date.now()}@zoop.delivery`,
        phone: `+91998877${Math.floor(1000 + Math.random() * 9000)}`,
        serviceArea: 'Zone 2',
      });
    expect(secondAgent.status).toBe(201);

    // Try to update createdAgentId with second agent's email
    const collisionRes = await request(app)
      .patch(`/api/v1/agents/${createdAgentId}`)
      .send({ email: secondAgent.body.data.email });

    expect(collisionRes.status).toBe(409);
    expect(collisionRes.body.error.code).toBe('CONFLICT');

    // Clean up second agent
    await request(app).delete(`/api/v1/agents/${secondAgent.body.data.id}`);
  });

  it('DELETE /api/v1/agents/:id should remove the agent (204 No Content)', async () => {
    const res = await request(app)
      .delete(`/api/v1/agents/${createdAgentId}`);

    expect(res.status).toBe(204);
    expect(res.body).toEqual({});
  });

  it('GET /api/v1/agents/:id should confirm 404 after deletion', async () => {
    const res = await request(app)
      .get(`/api/v1/agents/${createdAgentId}`);

    expect(res.status).toBe(404);
  });

  it('Server error handling: should return 500 without leaking stack traces on unexpected error', async () => {
    const findUniqueSpy = (jest.spyOn(prisma.deliveryAgent, 'findUnique') as unknown as jest.SpyInstance)
      .mockRejectedValueOnce(new Error('Unexpected database connection timeout'));

    const fakeUuid = '11111111-1111-1111-1111-111111111111';
    const res = await request(app).get(`/api/v1/agents/${fakeUuid}`);

    findUniqueSpy.mockRestore();

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INTERNAL_SERVER_ERROR');
    expect(res.body.stack).toBeUndefined();
    expect(res.body.error.stack).toBeUndefined();
  });
});
