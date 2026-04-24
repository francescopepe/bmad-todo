import { describe, it, expect } from 'vitest';
import { CreateTodoSchema, UpdateTodoSchema } from './schemas';

describe('CreateTodoSchema', () => {
  it('accepts a valid title', () => {
    const result = CreateTodoSchema.safeParse({ title: 'Buy groceries' });
    expect(result.success).toBe(true);
  });

  it('rejects an empty title', () => {
    const result = CreateTodoSchema.safeParse({ title: '' });
    expect(result.success).toBe(false);
  });

  it('rejects a title exceeding 500 characters', () => {
    const result = CreateTodoSchema.safeParse({ title: 'a'.repeat(501) });
    expect(result.success).toBe(false);
  });
});

describe('UpdateTodoSchema', () => {
  it('accepts an optional title', () => {
    const result = UpdateTodoSchema.safeParse({ title: 'Updated title' });
    expect(result.success).toBe(true);
  });

  it('accepts an optional completed flag', () => {
    const result = UpdateTodoSchema.safeParse({ completed: true });
    expect(result.success).toBe(true);
  });

  it('accepts an empty object', () => {
    const result = UpdateTodoSchema.safeParse({});
    expect(result.success).toBe(true);
  });
});
