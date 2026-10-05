import { Prisma } from '@prisma/client';
import { prisma } from '../../services/prisma.service';
import { CacheService } from '../../services/cache.service';
import { env } from '../../config/env.config';
import { NotFoundError } from '../../errors/NotFoundError';
import { ConflictError } from '../../errors/ConflictError';
import {
  CreateAgentDTO,
  UpdateAgentDTO,
  ListAgentsQueryDTO,
  ListAgentsResult,
  GetAgentResult,
  DeliveryAgent,
} from './agent.types';
import { PaginationMeta } from '../../utils/response.util';

export class AgentService {
  /**
   * Creates a new delivery agent.
   * Enforces uniqueness for email and phone before persisting.
   * Invalidates all list caches via O(1) list version increment.
   */
  public async createAgent(dto: CreateAgentDTO): Promise<DeliveryAgent> {
    const existingEmail = await prisma.deliveryAgent.findUnique({
      where: { email: dto.email },
    });
    if (existingEmail) {
      throw new ConflictError(`An agent with email "${dto.email}" already exists`, [
        { field: 'email', issue: 'Email address must be unique' },
      ]);
    }

    const existingPhone = await prisma.deliveryAgent.findUnique({
      where: { phone: dto.phone },
    });
    if (existingPhone) {
      throw new ConflictError(`An agent with phone number "${dto.phone}" already exists`, [
        { field: 'phone', issue: 'Phone number must be unique' },
      ]);
    }

    const agent = await prisma.deliveryAgent.create({
      data: {
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
        serviceArea: dto.serviceArea,
        status: dto.status,
      },
    });

    // Invalidate list caches
    await CacheService.onAgentCreated();

    return agent;
  }

  /**
   * Retrieves an individual agent by UUID using race-free versioned cache-aside.
   */
  public async getAgentById(id: string): Promise<GetAgentResult> {
    // 1. Check versioned detail cache
    const version = await CacheService.getDetailVersion(id);
    const cacheKey = CacheService.buildDetailKey(id, version);
    const cachedAgent = await CacheService.get<DeliveryAgent>(cacheKey);

    if (cachedAgent) {
      return { agent: cachedAgent, cached: true };
    }

    // 2. Fetch from PostgreSQL
    const agent = await prisma.deliveryAgent.findUnique({
      where: { id },
    });

    if (!agent) {
      throw new NotFoundError(`Delivery agent not found with ID "${id}"`);
    }

    // 3. Concurrency Guard: Only cache if version remained unchanged during DB query
    const currentVersion = await CacheService.getDetailVersion(id);
    if (currentVersion === version) {
      await CacheService.set(cacheKey, agent, env.REDIS_TTL_DETAIL_SECONDS);
    }

    return { agent, cached: false };
  }

  /**
   * Lists agents with pagination, search, status, and serviceArea filters using cache-aside.
   */
  public async listAgents(query: ListAgentsQueryDTO): Promise<ListAgentsResult> {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(100, Math.max(1, query.limit || 10));
    const skip = (page - 1) * limit;

    // 1. Query Cache Check with O(1) versioned namespace
    const listVersion = await CacheService.getListVersion();
    const cacheKey = CacheService.buildListKey(query as Record<string, unknown>, listVersion);
    const cachedResult = await CacheService.get<{
      agents: DeliveryAgent[];
      pagination: PaginationMeta;
    }>(cacheKey);

    if (cachedResult) {
      return {
        agents: cachedResult.agents,
        pagination: cachedResult.pagination,
        cached: true,
      };
    }

    // 2. Build Prisma Filter Conditions
    const where: Prisma.DeliveryAgentWhereInput = {};

    if (query.status) {
      where.status = query.status;
    }

    if (query.serviceArea && query.serviceArea.trim().length > 0) {
      where.serviceArea = {
        contains: query.serviceArea.trim(),
        mode: 'insensitive',
      };
    }

    if (query.q && query.q.trim().length > 0) {
      const search = query.q.trim();
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
      ];
    }

    const sortBy = query.sortBy || 'createdAt';
    const sortOrder = query.sortOrder || 'desc';

    // 3. Database Execution
    const [totalRecords, agents] = await Promise.all([
      prisma.deliveryAgent.count({ where }),
      prisma.deliveryAgent.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
    ]);

    const totalPages = Math.ceil(totalRecords / limit) || 1;
    const pagination: PaginationMeta = {
      page,
      limit,
      totalRecords,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    };

    // 4. Backfill Cache
    await CacheService.set(cacheKey, { agents, pagination }, env.REDIS_TTL_LIST_SECONDS);

    return { agents, pagination, cached: false };
  }

  /**
   * Partially updates a delivery agent.
   * Evicts the agent's detail cache and increments list version.
   */
  public async updateAgent(id: string, dto: UpdateAgentDTO): Promise<DeliveryAgent> {
    const existing = await prisma.deliveryAgent.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundError(`Delivery agent not found with ID "${id}"`);
    }

    // Verify unique constraints on email and phone changes
    if (dto.email && dto.email !== existing.email) {
      const emailCollision = await prisma.deliveryAgent.findUnique({
        where: { email: dto.email },
      });
      if (emailCollision && emailCollision.id !== id) {
        throw new ConflictError(`Email "${dto.email}" is already in use by another agent`, [
          { field: 'email', issue: 'Email address must be unique' },
        ]);
      }
    }

    if (dto.phone && dto.phone !== existing.phone) {
      const phoneCollision = await prisma.deliveryAgent.findUnique({
        where: { phone: dto.phone },
      });
      if (phoneCollision && phoneCollision.id !== id) {
        throw new ConflictError(`Phone "${dto.phone}" is already in use by another agent`, [
          { field: 'phone', issue: 'Phone number must be unique' },
        ]);
      }
    }

    const updated = await prisma.deliveryAgent.update({
      where: { id },
      data: dto,
    });

    // Invalidate detail cache and bump list version
    await CacheService.onAgentMutated(id);

    return updated;
  }

  /**
   * Deletes a delivery agent.
   * Evicts the agent's detail cache and increments list version.
   */
  public async deleteAgent(id: string): Promise<void> {
    const existing = await prisma.deliveryAgent.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundError(`Delivery agent not found with ID "${id}"`);
    }

    await prisma.deliveryAgent.delete({
      where: { id },
    });

    // Invalidate detail cache and bump list version
    await CacheService.onAgentMutated(id);
  }
}

export const agentService = new AgentService();
