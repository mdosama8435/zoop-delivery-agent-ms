import app from './app';
import { env } from './config/env.config';
import { PrismaService } from './services/prisma.service';
import { redisManager } from './config/redis.config';
import http from 'http';

const server = http.createServer(app);

server.listen(env.PORT, () => {
  console.log('====================================================');
  console.log(`🚀 Delivery Agent Management System (DAMS) API`);
  console.log(`🌐 Environment : ${env.NODE_ENV}`);
  console.log(`🔌 Listening on : http://localhost:${env.PORT}`);
  console.log(`🩺 Healthcheck  : http://localhost:${env.PORT}/api/v1/health`);
  console.log(`📦 Agent API   : http://localhost:${env.PORT}/api/v1/agents`);
  console.log('====================================================');
});

// Graceful Shutdown Lifecycle
let isShuttingDown = false;

async function handleGracefulShutdown(signal: string) {
  if (isShuttingDown) return;
  isShuttingDown = true;

  console.log(`\n[Process] Received ${signal}. Initiating graceful shutdown...`);

  // Force shutdown if cleanup exceeds 10 seconds
  const forceExitTimer = setTimeout(() => {
    console.error('[Process ERROR] Graceful shutdown timed out. Forcing process exit.');
    process.exit(1);
  }, 10000);
  forceExitTimer.unref();

  server.close(async () => {
    console.log('[HTTP] Server stopped accepting new connections.');

    try {
      await redisManager.disconnect();
      await PrismaService.disconnect();
      console.log('[Process] Cleanup completed successfully. Server shutting down.');
      process.exit(0);
    } catch (err) {
      console.error('[Process ERROR] Error occurred during teardown:', err);
      process.exit(1);
    }
  });
}

process.on('SIGTERM', () => handleGracefulShutdown('SIGTERM'));
process.on('SIGINT', () => handleGracefulShutdown('SIGINT'));
