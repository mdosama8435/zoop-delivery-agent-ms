import { redisClient, redisManager } from '../config/redis.config';
import { generateQueryHash } from '../utils/queryHash.util';

export class CacheService {
  private static readonly LIST_VERSION_KEY = 'dams:agents:list:version';
  private static readonly DETAIL_VERSION_PREFIX = 'dams:agents:detail:version:';
  private static readonly DETAIL_KEY_PREFIX = 'dams:agents:detail:';
  private static readonly LIST_KEY_PREFIX = 'dams:agents:list:';

  /**
   * Fail-open Redis GET wrapper. Returns null if Redis is offline or errors.
   */
  public static async get<T>(key: string): Promise<T | null> {
    if (!redisManager.isReady()) return null;

    try {
      const data = await redisClient.get(key);
      if (!data) return null;
      return JSON.parse(data) as T;
    } catch (err) {
      console.warn(`[CacheService WARNING] Redis GET failed for key "${key}": ${(err as Error).message}`);
      return null;
    }
  }

  /**
   * Fail-open Redis SET wrapper with TTL.
   */
  public static async set(key: string, value: unknown, ttlSeconds: number): Promise<void> {
    if (!redisManager.isReady()) return;

    try {
      const serialized = JSON.stringify(value);
      await redisClient.set(key, serialized, 'EX', ttlSeconds);
    } catch (err) {
      console.warn(`[CacheService WARNING] Redis SET failed for key "${key}": ${(err as Error).message}`);
    }
  }

  /**
   * Fail-open Redis DEL wrapper.
   */
  public static async del(key: string): Promise<void> {
    if (!redisManager.isReady()) return;

    try {
      await redisClient.del(key);
    } catch (err) {
      console.warn(`[CacheService WARNING] Redis DEL failed for key "${key}": ${(err as Error).message}`);
    }
  }

  /**
   * Retrieves or initializes the atomic version for a specific agent's detail cache.
   */
  public static async getDetailVersion(agentId: string): Promise<number> {
    if (!redisManager.isReady()) return 1;

    try {
      const key = `${CacheService.DETAIL_VERSION_PREFIX}${agentId}`;
      const version = await redisClient.get(key);
      if (!version) {
        await redisClient.set(key, '1');
        return 1;
      }
      return parseInt(version, 10) || 1;
    } catch (err) {
      return 1;
    }
  }

  /**
   * Atomically increments the detail version counter for an agent.
   */
  public static async incrementDetailVersion(agentId: string): Promise<number> {
    if (!redisManager.isReady()) return 1;

    try {
      const key = `${CacheService.DETAIL_VERSION_PREFIX}${agentId}`;
      return await redisClient.incr(key);
    } catch (err) {
      console.warn(`[CacheService WARNING] Failed to increment detail version for agent "${agentId}": ${(err as Error).message}`);
      return 1;
    }
  }

  /**
   * Retrieves or initializes the master version counter for all agent list caches.
   */
  public static async getListVersion(): Promise<number> {
    if (!redisManager.isReady()) return 1;

    try {
      const version = await redisClient.get(CacheService.LIST_VERSION_KEY);
      if (!version) {
        await redisClient.set(CacheService.LIST_VERSION_KEY, '1');
        return 1;
      }
      return parseInt(version, 10) || 1;
    } catch (err) {
      return 1;
    }
  }

  /**
   * O(1) List Invalidation: Atomically increments the master list version.
   * Instantly bypasses all previous cached query permutations without KEYS *.
   */
  public static async incrementListVersion(): Promise<number> {
    if (!redisManager.isReady()) return 1;

    try {
      return await redisClient.incr(CacheService.LIST_VERSION_KEY);
    } catch (err) {
      console.warn(`[CacheService WARNING] Failed to increment list version: ${(err as Error).message}`);
      return 1;
    }
  }

  /**
   * Constructs the deterministic versioned key for an agent's detail cache.
   */
  public static buildDetailKey(agentId: string, version: number): string {
    return `${CacheService.DETAIL_KEY_PREFIX}${agentId}:v${version}`;
  }

  /**
   * Constructs the deterministic versioned key for a paginated/filtered list query.
   */
  public static buildListKey(queryParams: Record<string, unknown>, listVersion: number): string {
    const hash = generateQueryHash(queryParams);
    return `${CacheService.LIST_KEY_PREFIX}v${listVersion}:${hash}`;
  }

  /**
   * Invalidation triggered when a new agent is created.
   */
  public static async onAgentCreated(): Promise<void> {
    await CacheService.incrementListVersion();
  }

  /**
   * Invalidation triggered when an agent is updated or deleted.
   * Evicts current detail cache and increments both versions.
   */
  public static async onAgentMutated(agentId: string): Promise<void> {
    const oldVersion = await CacheService.getDetailVersion(agentId);
    await CacheService.del(CacheService.buildDetailKey(agentId, oldVersion));
    await CacheService.incrementDetailVersion(agentId);
    await CacheService.incrementListVersion();
  }

  /**
   * Checks if Redis is currently connected and operational.
   */
  public static isHealthy(): boolean {
    return redisManager.isReady();
  }
}
