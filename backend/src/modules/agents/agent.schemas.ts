import { z } from 'zod';
import { AgentStatus } from '@prisma/client';

/**
 * Normalizes phone numbers by stripping whitespace/hyphens and canonicalizing
 * standard 10-digit Indian numbers and international numbers.
 */
export function normalizePhoneNumber(raw: string): string {
  if (typeof raw !== 'string') return '';
  const cleaned = raw.trim().replace(/[\s\-\(\)\.]/g, '');

  // 10-digit national number starting with 6, 7, 8, 9 (standard Indian mobile format)
  if (/^[6-9]\d{9}$/.test(cleaned)) {
    return `+91${cleaned}`;
  }

  // 11-digit starting with 0 followed by 10-digit number
  if (/^0[6-9]\d{9}$/.test(cleaned)) {
    return `+91${cleaned.slice(1)}`;
  }

  // Already prefixed with '+' and has 10 to 15 digits
  if (/^\+[1-9]\d{9,14}$/.test(cleaned)) {
    return cleaned;
  }

  // Pure digits of 10 to 15 length without '+'
  if (/^[1-9]\d{9,14}$/.test(cleaned)) {
    return `+${cleaned}`;
  }

  return cleaned;
}

const phoneSchema = z
  .string({ required_error: 'Phone number is required' })
  .transform(normalizePhoneNumber)
  .pipe(
    z
      .string()
      .regex(
        /^\+[1-9]\d{9,14}$/,
        'Phone number must be a valid 10-15 digit number (e.g. 9876543210 or +919876543210)'
      )
  );

export const CreateAgentSchema = z.object({
  name: z
    .string({ required_error: 'Full name is required' })
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must not exceed 100 characters'),
  phone: phoneSchema,
  email: z
    .string({ required_error: 'Email address is required' })
    .trim()
    .toLowerCase()
    .email('Invalid email address format')
    .max(255, 'Email must not exceed 255 characters'),
  serviceArea: z
    .string({ required_error: 'Service area is required' })
    .trim()
    .min(2, 'Service area must be at least 2 characters')
    .max(100, 'Service area must not exceed 100 characters'),
  status: z
    .nativeEnum(AgentStatus, {
      errorMap: () => ({ message: 'Status must be either ACTIVE or INACTIVE' }),
    })
    .default(AgentStatus.ACTIVE),
});

export const UpdateAgentSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, 'Name must be at least 2 characters')
      .max(100, 'Name must not exceed 100 characters')
      .optional(),
    phone: phoneSchema.optional(),
    email: z
      .string()
      .trim()
      .toLowerCase()
      .email('Invalid email address format')
      .max(255, 'Email must not exceed 255 characters')
      .optional(),
    serviceArea: z
      .string()
      .trim()
      .min(2, 'Service area must be at least 2 characters')
      .max(100, 'Service area must not exceed 100 characters')
      .optional(),
    status: z
      .nativeEnum(AgentStatus, {
        errorMap: () => ({ message: 'Status must be either ACTIVE or INACTIVE' }),
      })
      .optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update',
  });

export const AgentIdParamSchema = z.object({
  id: z.string().uuid({ message: 'Invalid ID format: must be a valid UUID v4' }),
});

export const ListAgentsQuerySchema = z.object({
  page: z.coerce.number().int().min(1, 'Page must be at least 1').default(1),
  limit: z.coerce.number().int().min(1, 'Limit must be at least 1').max(100, 'Limit cannot exceed 100').default(10),
  status: z.nativeEnum(AgentStatus).optional(),
  serviceArea: z.string().trim().optional(),
  q: z.string().trim().optional(),
  sortBy: z.enum(['createdAt', 'name', 'status', 'serviceArea']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});
