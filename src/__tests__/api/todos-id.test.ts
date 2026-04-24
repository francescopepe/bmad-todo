// @vitest-environment node
import { describe, it, expect, beforeEach } from 'vitest';
import { prisma } from '@/lib/prisma';
import { PATCH, DELETE } from '@/app/api/todos/[id]/route';

function makeParams(id: string) {
  return { params: Promise.resolve({ id }) };
}

beforeEach(async () => {
  await prisma.todo.deleteMany();
});

describe('PATCH /api/todos/:id', () => {
  it('updates completed field and returns 200', async () => {
    const todo = await prisma.todo.create({ data: { title: 'Test todo' } });

    const request = new Request(`http://localhost/api/todos/${todo.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed: true }),
    });

    const response = await PATCH(request, makeParams(todo.id));
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data.id).toBe(todo.id);
    expect(json.data.completed).toBe(true);
    expect(json.data.title).toBe('Test todo');
  });

  it('updates title and returns 200', async () => {
    const todo = await prisma.todo.create({ data: { title: 'Old title' } });

    const request = new Request(`http://localhost/api/todos/${todo.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Updated title' }),
    });

    const response = await PATCH(request, makeParams(todo.id));
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data.title).toBe('Updated title');
  });

  it('updates both title and completed', async () => {
    const todo = await prisma.todo.create({ data: { title: 'Original' } });

    const request = new Request(`http://localhost/api/todos/${todo.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'New title', completed: true }),
    });

    const response = await PATCH(request, makeParams(todo.id));
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data.title).toBe('New title');
    expect(json.data.completed).toBe(true);
  });

  it('returns 400 with VALIDATION_ERROR for empty body', async () => {
    const todo = await prisma.todo.create({ data: { title: 'Test' } });

    const request = new Request(`http://localhost/api/todos/${todo.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });

    const response = await PATCH(request, makeParams(todo.id));
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.success).toBe(false);
    expect(json.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 400 with VALIDATION_ERROR for unknown properties', async () => {
    const todo = await prisma.todo.create({ data: { title: 'Test' } });

    const request = new Request(`http://localhost/api/todos/${todo.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Valid', extra: true }),
    });

    const response = await PATCH(request, makeParams(todo.id));
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.success).toBe(false);
    expect(json.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 400 with VALIDATION_ERROR for invalid JSON', async () => {
    const todo = await prisma.todo.create({ data: { title: 'Test' } });

    const request = new Request(`http://localhost/api/todos/${todo.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: 'not json',
    });

    const response = await PATCH(request, makeParams(todo.id));
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.success).toBe(false);
    expect(json.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 404 with NOT_FOUND for nonexistent id', async () => {
    const request = new Request('http://localhost/api/todos/nonexistent', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed: true }),
    });

    const response = await PATCH(request, makeParams('nonexistent'));
    const json = await response.json();

    expect(response.status).toBe(404);
    expect(json.success).toBe(false);
    expect(json.error.code).toBe('NOT_FOUND');
  });

  it('returns ISO 8601 date strings in response', async () => {
    const todo = await prisma.todo.create({ data: { title: 'Test' } });

    const request = new Request(`http://localhost/api/todos/${todo.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed: true }),
    });

    const response = await PATCH(request, makeParams(todo.id));
    const json = await response.json();

    expect(typeof json.data.createdAt).toBe('string');
    expect(typeof json.data.updatedAt).toBe('string');
    expect(() => new Date(json.data.createdAt).toISOString()).not.toThrow();
    expect(() => new Date(json.data.updatedAt).toISOString()).not.toThrow();
  });

  it('returns response in { data, success } envelope', async () => {
    const todo = await prisma.todo.create({ data: { title: 'Test' } });

    const request = new Request(`http://localhost/api/todos/${todo.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed: true }),
    });

    const response = await PATCH(request, makeParams(todo.id));
    const json = await response.json();

    expect(json).toHaveProperty('data');
    expect(json).toHaveProperty('success', true);
    expect(json).not.toHaveProperty('error');
  });
});

describe('DELETE /api/todos/:id', () => {
  it('deletes existing todo and returns 200', async () => {
    const todo = await prisma.todo.create({ data: { title: 'To delete' } });

    const request = new Request(`http://localhost/api/todos/${todo.id}`, {
      method: 'DELETE',
    });

    const response = await DELETE(request, makeParams(todo.id));
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data).toEqual({ id: todo.id });

    // Verify actually deleted from database
    const found = await prisma.todo.findUnique({ where: { id: todo.id } });
    expect(found).toBeNull();
  });

  it('returns 404 with NOT_FOUND for nonexistent id', async () => {
    const request = new Request('http://localhost/api/todos/nonexistent', {
      method: 'DELETE',
    });

    const response = await DELETE(request, makeParams('nonexistent'));
    const json = await response.json();

    expect(response.status).toBe(404);
    expect(json.success).toBe(false);
    expect(json.error.code).toBe('NOT_FOUND');
  });

  it('returns response in { data, success } envelope', async () => {
    const todo = await prisma.todo.create({ data: { title: 'Test' } });

    const request = new Request(`http://localhost/api/todos/${todo.id}`, {
      method: 'DELETE',
    });

    const response = await DELETE(request, makeParams(todo.id));
    const json = await response.json();

    expect(json).toHaveProperty('data');
    expect(json).toHaveProperty('success', true);
    expect(json).not.toHaveProperty('error');
  });

  it('returns error in { error, success } envelope for not found', async () => {
    const request = new Request('http://localhost/api/todos/nonexistent', {
      method: 'DELETE',
    });

    const response = await DELETE(request, makeParams('nonexistent'));
    const json = await response.json();

    expect(json).toHaveProperty('error');
    expect(json).toHaveProperty('success', false);
    expect(json).not.toHaveProperty('data');
  });
});
