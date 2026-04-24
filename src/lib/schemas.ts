import { z } from 'zod';

export const CreateTodoSchema = z.object({
  title: z.string().trim().min(1).max(500),
});

export const UpdateTodoSchema = z.object({
  title: z.string().trim().min(1).max(500).optional(),
  completed: z.boolean().optional(),
}).strict().check(ctx => {
  if (ctx.value.title === undefined && ctx.value.completed === undefined) {
    ctx.issues.push({
      code: 'custom',
      input: ctx.value,
      message: 'At least one field (title or completed) must be provided',
      path: [],
    });
  }
});
