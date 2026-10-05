export type AgentStatus = 'ACTIVE' | 'INACTIVE';

export interface DeliveryAgent {
  id: string;
  name: string;
  phone: string;
  email: string;
  serviceArea: string;
  status: AgentStatus;
  createdAt: string;
  updatedAt: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  totalRecords: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta: {
    timestamp: string;
    cached?: boolean;
    requestId?: string;
    pagination?: PaginationMeta;
  };
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Array<{ field: string; issue: string }>;
  };
}

export interface AgentFilterParams {
  page?: number;
  limit?: number;
  status?: AgentStatus | '';
  serviceArea?: string;
  q?: string;
  sortBy?: 'createdAt' | 'name' | 'status' | 'serviceArea';
  sortOrder?: 'asc' | 'desc';
}

export interface CreateAgentInput {
  name: string;
  phone: string;
  email: string;
  serviceArea: string;
  status: AgentStatus;
}

export interface UpdateAgentInput {
  name?: string;
  phone?: string;
  email?: string;
  serviceArea?: string;
  status?: AgentStatus;
}
