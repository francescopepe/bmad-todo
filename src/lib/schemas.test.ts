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
  it('accepts a valid title-only update', () => {
    const result = UpdateTodoSchema.safeParse({ title: 'Updated title' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual({ title: 'Updated title' });
    }
  });

  it('accepts a valid completed-only update', () => {
    const result = UpdateTodoSchema.safeParse({ completed: true });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual({ completed: true });
    }
  });

  it('accepts both title and completed', () => {
    const result = UpdateTodoSchema.safeParse({ title: 'New', completed: false });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual({ title: 'New', completed: false });
    }
  });

  it('rejects an empty object', () => {
    const result = UpdateTodoSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it('rejects unknown properties', () => {
    const result = UpdateTodoSchema.safeParse({ title: 'Valid', extra: true });
    expect(result.success).toBe(false);
  });

  it('rejects whitespace-only title', () => {
    const result = UpdateTodoSchema.safeParse({ title: '   ' });
    expect(result.success).toBe(false);
  });

  it('preserves ZodObject type (has .shape)', () => {
    expect(UpdateTodoSchema.shape).toBeDefined();
    expect(UpdateTodoSchema.shape.title).toBeDefined();
    expect(UpdateTodoSchema.shape.completed).toBeDefined();
  });
});
