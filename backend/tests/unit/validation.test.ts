import {
  normalizePhoneNumber,
  CreateAgentSchema,
  UpdateAgentSchema,
  AgentIdParamSchema,
  ListAgentsQuerySchema,
} from '../../src/modules/agents/agent.schemas';
import { AgentStatus } from '@prisma/client';

describe('Unit: Validation & Normalization Logic', () => {
  describe('normalizePhoneNumber', () => {
    it('should canonicalize a 10-digit Indian mobile number to E.164 with +91 prefix', () => {
      expect(normalizePhoneNumber('9876543210')).toBe('+919876543210');
      expect(normalizePhoneNumber('8765432109')).toBe('+918765432109');
    });

    it('should strip leading zero from a 11-digit national format and add +91', () => {
      expect(normalizePhoneNumber('09876543210')).toBe('+919876543210');
    });

    it('should strip whitespace, hyphens, and parentheses from phone input', () => {
      expect(normalizePhoneNumber('+91 98765-43210')).toBe('+919876543210');
      expect(normalizePhoneNumber('+1 (415) 555-0198')).toBe('+14155550198');
    });

    it('should retain existing international + prefix', () => {
      expect(normalizePhoneNumber('+14155550198')).toBe('+14155550198');
      expect(normalizePhoneNumber('+447911123456')).toBe('+447911123456');
    });
  });

  describe('CreateAgentSchema', () => {
    it('should successfully validate a well-formed agent payload', () => {
      const payload = {
        name: 'Dev Sharma',
        phone: '9876543210',
        email: 'DEV.SHARMA@ZOOP.DELIVERY',
        serviceArea: 'Central Mumbai',
      };

      const parsed = CreateAgentSchema.parse(payload);
      expect(parsed.name).toBe('Dev Sharma');
      expect(parsed.phone).toBe('+919876543210');
      expect(parsed.email).toBe('dev.sharma@zoop.delivery'); // lowercase normalized
      expect(parsed.status).toBe(AgentStatus.ACTIVE); // default applied
    });

    it('should reject payload with missing name', () => {
      const payload = {
        phone: '9876543210',
        email: 'dev@zoop.delivery',
        serviceArea: 'Central Mumbai',
      };

      const result = CreateAgentSchema.safeParse(payload);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some((i) => i.path.includes('name'))).toBe(true);
      }
    });

    it('should reject invalid email format', () => {
      const payload = {
        name: 'Dev Sharma',
        phone: '9876543210',
        email: 'invalid-email-address',
        serviceArea: 'Central Mumbai',
      };

      const result = CreateAgentSchema.safeParse(payload);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some((i) => i.path.includes('email'))).toBe(true);
      }
    });

    it('should reject invalid phone format with too few digits', () => {
      const payload = {
        name: 'Dev Sharma',
        phone: '12345',
        email: 'dev@zoop.delivery',
        serviceArea: 'Central Mumbai',
      };

      const result = CreateAgentSchema.safeParse(payload);
      expect(result.success).toBe(false);
    });
  });

  describe('UpdateAgentSchema', () => {
    it('should accept partial updates with valid fields', () => {
      const payload = { status: AgentStatus.INACTIVE };
      const parsed = UpdateAgentSchema.parse(payload);
      expect(parsed.status).toBe(AgentStatus.INACTIVE);
    });

    it('should reject empty update payload with refinement rule', () => {
      const payload = {};
      const result = UpdateAgentSchema.safeParse(payload);
      expect(result.success).toBe(false);
    });
  });

  describe('AgentIdParamSchema', () => {
    it('should accept valid UUID v4', () => {
      const validUuid = '123e4567-e89b-12d3-a456-426614174000';
      const result = AgentIdParamSchema.safeParse({ id: validUuid });
      expect(result.success).toBe(true);
    });

    it('should reject non-UUID strings', () => {
      const invalidId = '123-not-a-uuid';
      const result = AgentIdParamSchema.safeParse({ id: invalidId });
      expect(result.success).toBe(false);
    });
  });

  describe('ListAgentsQuerySchema', () => {
    it('should provide default values for pagination and sorting', () => {
      const parsed = ListAgentsQuerySchema.parse({});
      expect(parsed.page).toBe(1);
      expect(parsed.limit).toBe(10);
      expect(parsed.sortBy).toBe('createdAt');
      expect(parsed.sortOrder).toBe('desc');
    });

    it('should coerce string numbers from query strings to integers', () => {
      const parsed = ListAgentsQuerySchema.parse({ page: '2', limit: '25' });
      expect(parsed.page).toBe(2);
      expect(parsed.limit).toBe(25);
    });
  });
});
