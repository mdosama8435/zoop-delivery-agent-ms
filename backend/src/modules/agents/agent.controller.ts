import { Request, Response, NextFunction } from 'express';
import { agentService } from './agent.service';
import { ResponseUtil } from '../../utils/response.util';
import { HttpStatus } from '../../constants/httpStatus';
import { CreateAgentDTO, UpdateAgentDTO, ListAgentsQueryDTO } from './agent.types';

export class AgentController {
  public async createAgent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto = req.body as CreateAgentDTO;
      const agent = await agentService.createAgent(dto);

      res.setHeader('Location', `/api/v1/agents/${agent.id}`);
      ResponseUtil.success(res, agent, HttpStatus.CREATED);
    } catch (err) {
      next(err);
    }
  }

  public async listAgents(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = req.query as ListAgentsQueryDTO;
      const result = await agentService.listAgents(query);

      ResponseUtil.success(res, result.agents, HttpStatus.OK, {
        cached: result.cached,
        pagination: result.pagination,
      });
    } catch (err) {
      next(err);
    }
  }

  public async getAgentById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const result = await agentService.getAgentById(id);

      ResponseUtil.success(res, result.agent, HttpStatus.OK, {
        cached: result.cached,
      });
    } catch (err) {
      next(err);
    }
  }

  public async updateAgent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const dto = req.body as UpdateAgentDTO;
      const updated = await agentService.updateAgent(id, dto);

      ResponseUtil.success(res, updated, HttpStatus.OK);
    } catch (err) {
      next(err);
    }
  }

  public async deleteAgent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      await agentService.deleteAgent(id);

      ResponseUtil.empty(res, HttpStatus.NO_CONTENT);
    } catch (err) {
      next(err);
    }
  }
}

export const agentController = new AgentController();
