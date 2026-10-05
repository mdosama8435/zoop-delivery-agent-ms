import { Router } from 'express';
import { agentRoutes } from '../modules/agents/agent.routes';
import { healthRoutes } from './health.routes';

const router = Router();

router.use('/agents', agentRoutes);
router.use('/health', healthRoutes);

export const apiV1Routes = router;
