import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act, waitFor, cleanup } from '@testing-library/react';
import { createElement, useImperativeHandle, forwardRef, createRef } from 'react';
import { useTodos } from '@/hooks/useTodos';
import type { Todo, ApiResponse } from '@/lib/types';
import type { UseTodosReturn } from '@/hooks/useTodos';

// Test helper: exposes hook return value via ref
const TestComponent = forwardRef<UseTodosReturn>(function TestComponent(_props, ref) {
  const result = useTodos();
  useImperativeHandle(ref, () => result);
  return createElement('div', null,
    result.isLoading && createElement('span', { 'data-testid': 'loading' }, 'loading'),
    result.error && createElement('span', { 'data-testid': 'error' }, result.error),
    createElement('span', { 'data-testid': 'count' }, String(result.todos.length)),
    createElement('ul', null,
      result.todos.map((t) =>
        createElement('li', { key: t.id, 'data-testid': `todo-${t.id}` }, t.title),
      ),
    ),
  );
});

function renderHook() {
  const ref = createRef<UseTodosReturn>();
  render(createElement(TestComponent, { ref }));
  return ref;
}

const fakeTodo: Todo = {
  id: 'abc123',
  title: 'Test task',
  completed: false,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

afterEach(() => {
  cleanup();
});

beforeEach(() => {
  vi.restoreAllMocks();
});

describe('useTodos', () => {
  describe('fetchTodos on mount', () => {
    it('starts in loading state and fetches todos', async () => {
      const response: ApiResponse<Todo[]> = { data: [fakeTodo], success: true };
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
        new Response(JSON.stringify(response), { status: 200 }),
      );

      renderHook();

      expect(screen.getByTestId('loading')).toBeDefined();

      await waitFor(() => {
        expect(screen.queryByTestId('loading')).toBeNull();
      });

      expect(screen.getByTestId('count').textContent).toBe('1');
      expect(screen.getByTestId('todo-abc123').textContent).toBe('Test task');
      expect(globalThis.fetch).toHaveBeenCalledWith('/api/todos');
    });

    it('sets error state when fetch fails', async () => {
      vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(new Error('Network error'));

      renderHook();

      await waitFor(() => {
        expect(screen.getByTestId('error')).toBeDefined();
      });

      expect(screen.getByTestId('error').textContent).toBe('Failed to load todos');
      expect(screen.getByTestId('count').textContent).toBe('0');
    });

    it('sets error state when API returns error response', async () => {
      const response: ApiResponse<Todo[]> = {
        success: false,
        error: { message: 'Server error', code: 'INTERNAL_ERROR' },
      };
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
        new Response(JSON.stringify(response), { status: 500 }),
      );

      renderHook();

      await waitFor(() => {
        expect(screen.getByTestId('error')).toBeDefined();
      });

      expect(screen.getByTestId('error').textContent).toBe('Failed to load todos');
    });
  });

  describe('addTodo — optimistic update', () => {
    it('adds todo optimistically then replaces with server response', async () => {
      const fetchResponse: ApiResponse<Todo[]> = { data: [], success: true };
      const createResponse: ApiResponse<Todo> = { data: fakeTodo, success: true };

      vi.spyOn(globalThis, 'fetch')
        .mockResolvedValueOnce(new Response(JSON.stringify(fetchResponse), { status: 200 }))
        .mockResolvedValueOnce(new Response(JSON.stringify(createResponse), { status: 201 }));

      const ref = renderHook();

      await waitFor(() => {
        expect(screen.queryByTestId('loading')).toBeNull();
      });

      expect(screen.getByTestId('count').textContent).toBe('0');

      await act(async () => {
        await ref.current!.addTodo('Test task');
      });

      expect(screen.getByTestId('count').textContent).toBe('1');
      expect(screen.getByTestId('todo-abc123').textContent).toBe('Test task');

      expect(globalThis.fetch).toHaveBeenCalledWith('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Test task' }),
      });
    });

    it('rolls back optimistic add on API failure', async () => {
      const fetchResponse: ApiResponse<Todo[]> = { data: [], success: true };

      vi.spyOn(globalThis, 'fetch')
        .mockResolvedValueOnce(new Response(JSON.stringify(fetchResponse), { status: 200 }))
        .mockRejectedValueOnce(new Error('Network error'));

      const ref = renderHook();

      await waitFor(() => {
        expect(screen.queryByTestId('loading')).toBeNull();
      });

      await act(async () => {
        await ref.current!.addTodo('Will fail');
      });

      expect(screen.getByTestId('count').textContent).toBe('0');
    });

    it('rolls back optimistic add when API returns error response', async () => {
      const fetchResponse: ApiResponse<Todo[]> = { data: [], success: true };
      const errorApiResponse: ApiResponse<Todo> = {
        success: false,
        error: { message: 'Validation failed', code: 'VALIDATION_ERROR' },
      };

      vi.spyOn(globalThis, 'fetch')
        .mockResolvedValueOnce(new Response(JSON.stringify(fetchResponse), { status: 200 }))
        .mockResolvedValueOnce(new Response(JSON.stringify(errorApiResponse), { status: 400 }));

      const ref = renderHook();

      await waitFor(() => {
        expect(screen.queryByTestId('loading')).toBeNull();
      });

      await act(async () => {
        await ref.current!.addTodo('Bad todo');
      });

      expect(screen.getByTestId('count').textContent).toBe('0');
    });
  });

  describe('stub methods', () => {
    it('toggleTodo, updateTodo, deleteTodo are callable no-ops', async () => {
      const fetchResponse: ApiResponse<Todo[]> = { data: [], success: true };
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
        new Response(JSON.stringify(fetchResponse), { status: 200 }),
      );

      const ref = renderHook();

      await waitFor(() => {
        expect(screen.queryByTestId('loading')).toBeNull();
      });

      await act(async () => {
        await ref.current!.toggleTodo('any-id');
        await ref.current!.updateTodo('any-id', 'new title');
        await ref.current!.deleteTodo('any-id');
      });

      expect(screen.getByTestId('count').textContent).toBe('0');
    });
  });
});
