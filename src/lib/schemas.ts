import { z } from 'zod';

export const CreateTodoSchema = z.object({
  title: z.string().trim().min(1).max(500),
});

export const UpdateTodoSchema = z.object({
  title: z.string().trim().min(1).max(500).optional(),
  completed: z.boolean().optional(),
});
