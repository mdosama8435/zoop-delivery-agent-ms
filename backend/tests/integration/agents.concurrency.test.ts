import request from 'supertest';
import app from '../../src/app';
import { prisma } from '../../src/services/prisma.service';
import { agentService } from '../../src/modules/agents/agent.service';
import { CacheService } from '../../src/services/cache.service';
import { DeliveryAgent } from '../../src/modules/agents/agent.types';

describe('Integration: Real Concurrency & Stale-Cache Race Condition Protection', () => {
  let agentId: string;
  const initialEmail = `race.initial.${Date.now()}@zoop.delivery`;
  const initialPhone = `+919811${Math.floor(100000 + Math.random() * 900000)}`;

  beforeAll(async () => {
    // Seed initial agent
    const agent = await prisma.deliveryAgent.create({
      data: {
        name: 'Initial Name V1',
        email: initialEmail,
        phone: initialPhone,
        serviceArea: 'Central Race Hub',
        status: 'ACTIVE',
      },
    });
    agentId = agent.id;
  });

  afterAll(async () => {
    if (agentId) {
      await prisma.deliveryAgent.deleteMany({ where: { id: agentId } });
    }
  });

  it('MANDATORY: Simulates GET (Redis Miss) -> DB Fetch -> Concurrent UPDATE -> Prevent Old Data Cache Overwrite', async () => {
    // Step 1: Ensure Redis cache is cold for this agent
    const initialVersion = await CacheService.getDetailVersion(agentId);
    const initialKey = CacheService.buildDetailKey(agentId, initialVersion);
    await CacheService.del(initialKey);

    // Verify Redis is a miss before starting
    const preCheck = await CacheService.get<DeliveryAgent>(initialKey);
    expect(preCheck).toBeNull();

    // Step 2: Spy on prisma.deliveryAgent.findUnique to intercept during the microsecond window
    // between fetching old data from DB and attempting to write it into Redis cache.
    const originalFindUnique = prisma.deliveryAgent.findUnique.bind(prisma.deliveryAgent);
    let concurrentUpdateExecuted = false;

    const findUniqueSpy = (jest.spyOn(prisma.deliveryAgent, 'findUnique') as unknown as jest.SpyInstance).mockImplementation(
      async (args: { where: { id: string } }) => {
        // Execute real DB query to get snapshot
        const dbResult = await originalFindUnique(args as any);

        // Simulate concurrent UPDATE happening during the GET execution
        if (!concurrentUpdateExecuted && args.where.id === agentId) {
          concurrentUpdateExecuted = true;

          // Perform concurrent update directly via service to simulate incoming PATCH /agents/:id
          await agentService.updateAgent(agentId, {
            name: 'Concurrent Updated Name V2',
            serviceArea: 'New Race Area V2',
          });
        }

        // Return the snapshot that was read before the update completed
        return dbResult;
      }
    );

    // Step 3: Trigger GET request that experiences the race condition
    const getResult = await agentService.getAgentById(agentId);
    expect(getResult).toBeDefined();

    // Restore the spy immediately
    findUniqueSpy.mockRestore();

    expect(concurrentUpdateExecuted).toBe(true);

    // Step 4: Verification of Concurrency Guard Protection Mechanism
    // The version counter in Redis must have incremented during the concurrent update
    const currentVersionAfterRace = await CacheService.getDetailVersion(agentId);
    expect(currentVersionAfterRace).toBeGreaterThan(initialVersion);

    // CRITICAL: The old key at initialVersion must NOT contain the stale data
    const oldKeyData = await CacheService.get<DeliveryAgent>(initialKey);
    expect(oldKeyData).toBeNull();

    // CRITICAL: The new versioned key must NOT contain the old name
    const newKey = CacheService.buildDetailKey(agentId, currentVersionAfterRace);
    const newKeyData = await CacheService.get<DeliveryAgent>(newKey);
    if (newKeyData) {
      expect(newKeyData.name).not.toBe('Initial Name V1');
    }

    // Step 5: Subsequent GET must return the new data and safely populate the new cache version
    const subsequentRead = await agentService.getAgentById(agentId);
    expect(subsequentRead.agent.name).toBe('Concurrent Updated Name V2');
    expect(subsequentRead.agent.serviceArea).toBe('New Race Area V2');

    // Step 6: Next read must be a valid Cache HIT containing the new data
    const cachedRead = await agentService.getAgentById(agentId);
    expect(cachedRead.cached).toBe(true);
    expect(cachedRead.agent.name).toBe('Concurrent Updated Name V2');
  });

  it('Verifies race-safety across parallel HTTP requests', async () => {
    // Parallel reads and updates on the same agent
    const requests = await Promise.all([
      request(app).get(`/api/v1/agents/${agentId}`),
      request(app).patch(`/api/v1/agents/${agentId}`).send({ status: 'INACTIVE' }),
      request(app).get(`/api/v1/agents/${agentId}`),
      request(app).patch(`/api/v1/agents/${agentId}`).send({ status: 'ACTIVE' }),
      request(app).get(`/api/v1/agents/${agentId}`),
    ]);

    // All requests should return valid HTTP statuses (200 OK)
    requests.forEach((res) => {
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    // The final state in DB and cache must be consistent
    const finalDetail = await request(app).get(`/api/v1/agents/${agentId}`);
    expect(finalDetail.status).toBe(200);
    expect(finalDetail.body.data.id).toBe(agentId);
    expect(['ACTIVE', 'INACTIVE']).toContain(finalDetail.body.data.status);
  });
});
