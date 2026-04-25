// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { successResponse, errorResponse, serializeTodo } from '@/lib/apiHelpers';

describe('apiHelpers', () => {
  describe('successResponse', () => {
    it('returns JSON response with data and success: true', async () => {
      const res = successResponse({ items: [1, 2, 3] });
      const body = await res.json();

      expect(body).toEqual({ data: { items: [1, 2, 3] }, success: true });
      expect(res.status).toBe(200);
    });

    it('uses custom status code when provided', async () => {
      const res = successResponse('created', 201);

      expect(res.status).toBe(201);
      const body = await res.json();
      expect(body).toEqual({ data: 'created', success: true });
    });
  });

  describe('errorResponse', () => {
    it('returns JSON response with error and success: false', async () => {
      const error = { message: 'Not found', code: 'NOT_FOUND' };
      const res = errorResponse(error, 404);
      const body = await res.json();

      expect(body).toEqual({ error: { message: 'Not found', code: 'NOT_FOUND' }, success: false });
      expect(res.status).toBe(404);
    });

    it('defaults to 500 status code', async () => {
      const error = { message: 'Server error', code: 'INTERNAL_ERROR' };
      const res = errorResponse(error);

      expect(res.status).toBe(500);
    });

    it('includes optional details in error response', async () => {
      const error = { message: 'Validation failed', code: 'VALIDATION_ERROR', details: { field: 'title' } };
      const res = errorResponse(error, 400);
      const body = await res.json();

      expect(body.error.details).toEqual({ field: 'title' });
    });
  });

  describe('serializeTodo', () => {
    it('converts Date objects to ISO 8601 strings', () => {
      const prismaTodo = {
        id: 'abc123',
        title: 'Test task',
        completed: false,
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-02T12:30:00.000Z'),
      };

      const result = serializeTodo(prismaTodo);

      expect(result).toEqual({
        id: 'abc123',
        title: 'Test task',
        completed: false,
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-02T12:30:00.000Z',
      });
    });

    it('preserves all other fields as-is', () => {
      const prismaTodo = {
        id: 'xyz789',
        title: 'Another task',
        completed: true,
        createdAt: new Date('2026-03-15T08:00:00.000Z'),
        updatedAt: new Date('2026-03-15T08:00:00.000Z'),
      };

      const result = serializeTodo(prismaTodo);

      expect(result.id).toBe('xyz789');
      expect(result.title).toBe('Another task');
      expect(result.completed).toBe(true);
    });
  });
});
