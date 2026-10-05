import { AgentStatus, DeliveryAgent } from '@prisma/client';
import { PaginationMeta } from '../../utils/response.util';

export { AgentStatus, DeliveryAgent };

export interface CreateAgentDTO {
  name: string;
  phone: string;
  email: string;
  serviceArea: string;
  status?: AgentStatus;
}

export interface UpdateAgentDTO {
  name?: string;
  phone?: string;
  email?: string;
  serviceArea?: string;
  status?: AgentStatus;
}

export interface ListAgentsQueryDTO {
  page?: number;
  limit?: number;
  status?: AgentStatus;
  serviceArea?: string;
  q?: string;
  sortBy?: 'createdAt' | 'name' | 'status' | 'serviceArea';
  sortOrder?: 'asc' | 'desc';
}

export interface ListAgentsResult {
  agents: DeliveryAgent[];
  pagination: PaginationMeta;
  cached: boolean;
}

export interface GetAgentResult {
  agent: DeliveryAgent;
  cached: boolean;
}
