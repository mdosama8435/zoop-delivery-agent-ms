import { Router } from 'express';
import { agentController } from './agent.controller';
import { validate } from '../../middlewares/validate';
import {
  CreateAgentSchema,
  UpdateAgentSchema,
  AgentIdParamSchema,
  ListAgentsQuerySchema,
} from './agent.schemas';

const router = Router();

router.post(
  '/',
  validate({ body: CreateAgentSchema }),
  agentController.createAgent.bind(agentController)
);

router.get(
  '/',
  validate({ query: ListAgentsQuerySchema }),
  agentController.listAgents.bind(agentController)
);

router.get(
  '/:id',
  validate({ params: AgentIdParamSchema }),
  agentController.getAgentById.bind(agentController)
);

router.patch(
  '/:id',
  validate({ params: AgentIdParamSchema, body: UpdateAgentSchema }),
  agentController.updateAgent.bind(agentController)
);

router.delete(
  '/:id',
  validate({ params: AgentIdParamSchema }),
  agentController.deleteAgent.bind(agentController)
);

export const agentRoutes = router;
