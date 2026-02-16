import { z } from 'zod';

export const createTaskSchema = z.object({
  executionId: z.number().int(),
  description: z.string().min(3),
  assignedMechanicId: z.number().int().optional(),
});

export const updateTaskSchema = z.object({
  description: z.string().min(3).optional(),
  assignedMechanicId: z.number().int().optional(),
});
