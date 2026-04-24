// @vitest-environment node
import { describe, it, expect, beforeEach } from 'vitest';
import { prisma } from '@/lib/prisma';
import { GET, POST } from '@/app/api/todos/route';

beforeEach(async () => {
  await prisma.todo.deleteMany();
});

describe('POST /api/todos', () => {
  it('creates a todo with a valid title and returns 201', async () => {
    const request = new Request('http://localhost/api/todos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Buy groceries' }),
    });

    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(201);
    expect(json.success).toBe(true);
    expect(json.data).toMatchObject({
      title: 'Buy groceries',
      completed: false,
    });
    expect(json.data.id).toBeDefined();
    expect(json.data.createdAt).toBeDefined();
    expect(json.data.updatedAt).toBeDefined();
    // Verify dates are ISO 8601 strings
    expect(() => new Date(json.data.createdAt).toISOString()).not.toThrow();
    expect(() => new Date(json.data.updatedAt).toISOString()).not.toThrow();
  });

  it('returns 400 with VALIDATION_ERROR for empty title', async () => {
    const request = new Request('http://localhost/api/todos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: '' }),
    });

    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.success).toBe(false);
    expect(json.error.code).toBe('VALIDATION_ERROR');
    expect(json.error.message).toBe('Validation failed');
    expect(json.error.details).toBeDefined();
  });

  it('returns 400 with VALIDATION_ERROR for whitespace-only title', async () => {
    const request = new Request('http://localhost/api/todos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: '   ' }),
    });

    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.success).toBe(false);
    expect(json.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 400 with VALIDATION_ERROR for missing body', async () => {
    const request = new Request('http://localhost/api/todos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });

    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.success).toBe(false);
    expect(json.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 400 with VALIDATION_ERROR for invalid JSON body', async () => {
    const request = new Request('http://localhost/api/todos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'not json',
    });

    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.success).toBe(false);
    expect(json.error.code).toBe('VALIDATION_ERROR');
    expect(json.error.details).toEqual([{ message: 'Invalid JSON body' }]);
  });

  it('returns 400 with VALIDATION_ERROR for title exceeding 500 chars', async () => {
    const request = new Request('http://localhost/api/todos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'a'.repeat(501) }),
    });

    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.success).toBe(false);
    expect(json.error.code).toBe('VALIDATION_ERROR');
  });
});

describe('GET /api/todos', () => {
  it('returns todos ordered by createdAt descending', async () => {
    // Create todos with slight delay to ensure different timestamps
    await prisma.todo.create({ data: { title: 'First todo' } });
    // Small delay to ensure different createdAt
    await new Promise((resolve) => setTimeout(resolve, 50));
    await prisma.todo.create({ data: { title: 'Second todo' } });

    const request = new Request('http://localhost/api/todos');
    const response = await GET(request);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data).toHaveLength(2);
    expect(json.data[0].title).toBe('Second todo');
    expect(json.data[1].title).toBe('First todo');
    // Verify dates are ISO strings
    expect(typeof json.data[0].createdAt).toBe('string');
    expect(typeof json.data[0].updatedAt).toBe('string');
  });

  it('returns empty array with 200 when no todos exist', async () => {
    const request = new Request('http://localhost/api/todos');
    const response = await GET(request);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data).toEqual([]);
  });
});
