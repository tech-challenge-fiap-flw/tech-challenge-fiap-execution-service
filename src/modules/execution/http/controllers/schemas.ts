import { z } from 'zod';

export const createExecutionSchema = z.object({
  serviceOrderId: z.number().int(),
  mechanicId: z.number().int(),
  notes: z.string().optional(),
});
