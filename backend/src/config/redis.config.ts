import Redis from 'ioredis';
import { env } from './env.config';

class RedisConnectionManager {
  private client: Redis | null = null;
  private isConnected = false;

  public getClient(): Redis {
    if (!this.client) {
      this.client = new Redis(env.REDIS_URL, {
        maxRetriesPerRequest: 1,
        enableReadyCheck: true,
        retryStrategy(times) {
          const delay = Math.min(times * 500, 3000);
          return delay;
        },
        lazyConnect: false,
      });

      this.client.on('connect', () => {
        this.isConnected = true;
        console.log('[Redis] Connecting to Redis instance...');
      });

      this.client.on('ready', () => {
        this.isConnected = true;
        console.log('[Redis] Connected and ready to receive commands');
      });

      this.client.on('error', (err) => {
        this.isConnected = false;
        // Non-fatal warning because of fail-open architecture
        console.warn(`[Redis WARNING] Cache connection issue: ${err.message}`);
      });

      this.client.on('close', () => {
        this.isConnected = false;
      });
    }

    return this.client;
  }

  public isReady(): boolean {
    return this.isConnected && this.client?.status === 'ready';
  }

  public async disconnect(): Promise<void> {
    if (this.client) {
      try {
        await this.client.quit();
        console.log('[Redis] Connection cleanly terminated');
      } catch (err) {
        console.warn('[Redis] Force disconnecting client');
        this.client.disconnect();
      }
    }
  }
}

export const redisManager = new RedisConnectionManager();
export const redisClient = redisManager.getClient();
