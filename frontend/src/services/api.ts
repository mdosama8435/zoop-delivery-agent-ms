import {
  DeliveryAgent,
  ApiResponse,
  ApiErrorResponse,
  AgentFilterParams,
  CreateAgentInput,
  UpdateAgentInput,
} from '../types/agent';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export class ApiError extends Error {
  public readonly code: string;
  public readonly details?: Array<{ field: string; issue: string }>;

  constructor(message: string, code = 'API_ERROR', details?: Array<{ field: string; issue: string }>) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.details = details;
  }
}

async function handleResponse<T>(res: Response): Promise<ApiResponse<T>> {
  if (res.status === 204) {
    return {
      success: true,
      data: null as unknown as T,
      meta: { timestamp: new Date().toISOString() },
    };
  }

  const json = await res.json();

  if (!res.ok || json.success === false) {
    const errorJson = json as ApiErrorResponse;
    throw new ApiError(
      errorJson.error?.message || `Request failed with status ${res.status}`,
      errorJson.error?.code || 'UNKNOWN_ERROR',
      errorJson.error?.details
    );
  }

  return json as ApiResponse<T>;
}

export const apiService = {
  async getHealth() {
    const res = await fetch(`${API_BASE}/health`, { cache: 'no-store' });
    return handleResponse<{
      status: 'healthy' | 'degraded' | 'unhealthy';
      uptime: number;
      services: { database: string; redis: string };
    }>(res);
  },

  async listAgents(params: AgentFilterParams = {}) {
    const query = new URLSearchParams();
    if (params.page) query.set('page', params.page.toString());
    if (params.limit) query.set('limit', params.limit.toString());
    if (params.status) query.set('status', params.status);
    if (params.serviceArea) query.set('serviceArea', params.serviceArea);
    if (params.q) query.set('q', params.q);
    if (params.sortBy) query.set('sortBy', params.sortBy);
    if (params.sortOrder) query.set('sortOrder', params.sortOrder);

    const url = `${API_BASE}/agents?${query.toString()}`;
    const res = await fetch(url, { cache: 'no-store' });
    return handleResponse<DeliveryAgent[]>(res);
  },

  async getAgentById(id: string) {
    const res = await fetch(`${API_BASE}/agents/${id}`, { cache: 'no-store' });
    return handleResponse<DeliveryAgent>(res);
  },

  async createAgent(input: CreateAgentInput) {
    const res = await fetch(`${API_BASE}/agents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    return handleResponse<DeliveryAgent>(res);
  },

  async updateAgent(id: string, input: UpdateAgentInput) {
    const res = await fetch(`${API_BASE}/agents/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    return handleResponse<DeliveryAgent>(res);
  },

  async deleteAgent(id: string) {
    const res = await fetch(`${API_BASE}/agents/${id}`, {
      method: 'DELETE',
    });
    return handleResponse<void>(res);
  },
};
