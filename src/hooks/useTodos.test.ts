import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act, waitFor, cleanup } from '@testing-library/react';
import { createElement, useImperativeHandle, forwardRef, createRef } from 'react';
import { useTodos } from '@/hooks/useTodos';
import type { Todo, ApiResponse } from '@/lib/types';
import type { UseTodosReturn, UseTodosOptions } from '@/hooks/useTodos';

// Test helper: exposes hook return value via ref
interface TestComponentProps {
  options?: UseTodosOptions;
}

const TestComponent = forwardRef<UseTodosReturn, TestComponentProps>(function TestComponent({ options }, ref) {
  const result = useTodos(options);
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

function renderHookWithOptions(options: UseTodosOptions) {
  const ref = createRef<UseTodosReturn>();
  render(createElement(TestComponent, { ref, options }));
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

  describe('addTodo — onError callback', () => {
    it('calls onError with correct message on API error response', async () => {
      const fetchResponse: ApiResponse<Todo[]> = { data: [], success: true };
      const onError = vi.fn();

      vi.spyOn(globalThis, 'fetch')
        .mockResolvedValueOnce(new Response(JSON.stringify(fetchResponse), { status: 200 }))
        .mockResolvedValueOnce(new Response('Internal Server Error', { status: 500 }));

      const ref = renderHookWithOptions({ onError });

      await waitFor(() => {
        expect(screen.queryByTestId('loading')).toBeNull();
      });

      await act(async () => {
        await ref.current!.addTodo('Will fail');
      });

      expect(onError).toHaveBeenCalledWith("Couldn't add task. Try again.");
    });

    it('calls onError with correct message on network error', async () => {
      const fetchResponse: ApiResponse<Todo[]> = { data: [], success: true };
      const onError = vi.fn();

      vi.spyOn(globalThis, 'fetch')
        .mockResolvedValueOnce(new Response(JSON.stringify(fetchResponse), { status: 200 }))
        .mockRejectedValueOnce(new Error('Network error'));

      const ref = renderHookWithOptions({ onError });

      await waitFor(() => {
        expect(screen.queryByTestId('loading')).toBeNull();
      });

      await act(async () => {
        await ref.current!.addTodo('Will fail');
      });

      expect(onError).toHaveBeenCalledWith("Couldn't add task. Try again.");
    });
  });

  describe('toggleTodo — optimistic update', () => {
    it('toggles todo completed state optimistically then updates with server response', async () => {
      const fetchResponse: ApiResponse<Todo[]> = { data: [fakeTodo], success: true };
      const toggledTodo: Todo = { ...fakeTodo, completed: true, updatedAt: '2026-01-02T00:00:00.000Z' };
      const toggleResponse: ApiResponse<Todo> = { data: toggledTodo, success: true };

      vi.spyOn(globalThis, 'fetch')
        .mockResolvedValueOnce(new Response(JSON.stringify(fetchResponse), { status: 200 }))
        .mockResolvedValueOnce(new Response(JSON.stringify(toggleResponse), { status: 200 }));

      const ref = renderHook();

      await waitFor(() => {
        expect(screen.queryByTestId('loading')).toBeNull();
      });

      await act(async () => {
        await ref.current!.toggleTodo('abc123');
      });

      expect(ref.current!.todos[0].completed).toBe(true);
      expect(globalThis.fetch).toHaveBeenCalledWith('/api/todos/abc123', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: true }),
      });
    });

    it('rolls back on API failure and calls onError', async () => {
      const fetchResponse: ApiResponse<Todo[]> = { data: [fakeTodo], success: true };
      const onError = vi.fn();

      vi.spyOn(globalThis, 'fetch')
        .mockResolvedValueOnce(new Response(JSON.stringify(fetchResponse), { status: 200 }))
        .mockRejectedValueOnce(new Error('Network error'));

      const ref = renderHookWithOptions({ onError });

      await waitFor(() => {
        expect(screen.queryByTestId('loading')).toBeNull();
      });

      await act(async () => {
        await ref.current!.toggleTodo('abc123');
      });

      expect(ref.current!.todos[0].completed).toBe(false);
      expect(onError).toHaveBeenCalledWith("Couldn't update task. Try again.");
    });

    it('rolls back when API returns error response', async () => {
      const fetchResponse: ApiResponse<Todo[]> = { data: [fakeTodo], success: true };
      const errorResponse: ApiResponse<Todo> = {
        success: false,
        error: { message: 'Not found', code: 'NOT_FOUND' },
      };
      const onError = vi.fn();

      vi.spyOn(globalThis, 'fetch')
        .mockResolvedValueOnce(new Response(JSON.stringify(fetchResponse), { status: 200 }))
        .mockResolvedValueOnce(new Response(JSON.stringify(errorResponse), { status: 404 }));

      const ref = renderHookWithOptions({ onError });

      await waitFor(() => {
        expect(screen.queryByTestId('loading')).toBeNull();
      });

      await act(async () => {
        await ref.current!.toggleTodo('abc123');
      });

      expect(ref.current!.todos[0].completed).toBe(false);
      expect(onError).toHaveBeenCalledWith("Couldn't update task. Try again.");
    });

    it('rolls back when API returns non-ok status', async () => {
      const fetchResponse: ApiResponse<Todo[]> = { data: [fakeTodo], success: true };
      const onError = vi.fn();

      vi.spyOn(globalThis, 'fetch')
        .mockResolvedValueOnce(new Response(JSON.stringify(fetchResponse), { status: 200 }))
        .mockResolvedValueOnce(new Response('Internal Server Error', { status: 500 }));

      const ref = renderHookWithOptions({ onError });

      await waitFor(() => {
        expect(screen.queryByTestId('loading')).toBeNull();
      });

      await act(async () => {
        await ref.current!.toggleTodo('abc123');
      });

      expect(ref.current!.todos[0].completed).toBe(false);
      expect(onError).toHaveBeenCalledWith("Couldn't update task. Try again.");
    });

    it('does nothing when toggling a non-existent todo', async () => {
      const fetchResponse: ApiResponse<Todo[]> = { data: [fakeTodo], success: true };

      vi.spyOn(globalThis, 'fetch')
        .mockResolvedValueOnce(new Response(JSON.stringify(fetchResponse), { status: 200 }));

      const ref = renderHook();

      await waitFor(() => {
        expect(screen.queryByTestId('loading')).toBeNull();
      });

      await act(async () => {
        await ref.current!.toggleTodo('non-existent');
      });

      // Only the initial fetch should have been called
      expect(globalThis.fetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('updateTodo — optimistic update', () => {
    it('fires PATCH with { title } and updates local state on success', async () => {
      const fetchResponse: ApiResponse<Todo[]> = { data: [fakeTodo], success: true };
      const updatedTodo: Todo = { ...fakeTodo, title: 'Updated task', updatedAt: '2026-01-02T00:00:00.000Z' };
      const updateResponse: ApiResponse<Todo> = { data: updatedTodo, success: true };

      vi.spyOn(globalThis, 'fetch')
        .mockResolvedValueOnce(new Response(JSON.stringify(fetchResponse), { status: 200 }))
        .mockResolvedValueOnce(new Response(JSON.stringify(updateResponse), { status: 200 }));

      const ref = renderHook();

      await waitFor(() => {
        expect(screen.queryByTestId('loading')).toBeNull();
      });

      await act(async () => {
        await ref.current!.updateTodo('abc123', 'Updated task');
      });

      expect(ref.current!.todos[0].title).toBe('Updated task');
      expect(globalThis.fetch).toHaveBeenCalledWith('/api/todos/abc123', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Updated task' }),
      });
    });

    it('rolls back to previous state on API failure and calls onError', async () => {
      const fetchResponse: ApiResponse<Todo[]> = { data: [fakeTodo], success: true };
      const errorResponse: ApiResponse<Todo> = {
        success: false,
        error: { message: 'Not found', code: 'NOT_FOUND' },
      };
      const onError = vi.fn();

      vi.spyOn(globalThis, 'fetch')
        .mockResolvedValueOnce(new Response(JSON.stringify(fetchResponse), { status: 200 }))
        .mockResolvedValueOnce(new Response(JSON.stringify(errorResponse), { status: 404 }));

      const ref = renderHookWithOptions({ onError });

      await waitFor(() => {
        expect(screen.queryByTestId('loading')).toBeNull();
      });

      await act(async () => {
        await ref.current!.updateTodo('abc123', 'Will fail');
      });

      expect(ref.current!.todos[0].title).toBe('Test task');
      expect(onError).toHaveBeenCalledWith("Couldn't save edit. Try again.");
    });

    it('rolls back on network error', async () => {
      const fetchResponse: ApiResponse<Todo[]> = { data: [fakeTodo], success: true };
      const onError = vi.fn();

      vi.spyOn(globalThis, 'fetch')
        .mockResolvedValueOnce(new Response(JSON.stringify(fetchResponse), { status: 200 }))
        .mockRejectedValueOnce(new Error('Network error'));

      const ref = renderHookWithOptions({ onError });

      await waitFor(() => {
        expect(screen.queryByTestId('loading')).toBeNull();
      });

      await act(async () => {
        await ref.current!.updateTodo('abc123', 'Will fail');
      });

      expect(ref.current!.todos[0].title).toBe('Test task');
      expect(onError).toHaveBeenCalledWith("Couldn't save edit. Try again.");
    });
  });

  describe('deleteTodo — optimistic delete', () => {
    it('fires DELETE to /api/todos/{id} and removes todo from local state on success', async () => {
      const fetchResponse: ApiResponse<Todo[]> = { data: [fakeTodo], success: true };
      const deleteResponse = { data: { id: 'abc123' }, success: true };

      vi.spyOn(globalThis, 'fetch')
        .mockResolvedValueOnce(new Response(JSON.stringify(fetchResponse), { status: 200 }))
        .mockResolvedValueOnce(new Response(JSON.stringify(deleteResponse), { status: 200 }));

      const ref = renderHook();

      await waitFor(() => {
        expect(screen.queryByTestId('loading')).toBeNull();
      });

      expect(screen.getByTestId('count').textContent).toBe('1');

      await act(async () => {
        await ref.current!.deleteTodo('abc123');
      });

      expect(screen.getByTestId('count').textContent).toBe('0');
      expect(globalThis.fetch).toHaveBeenCalledWith('/api/todos/abc123', { method: 'DELETE' });
    });

    it('rolls back (todo reappears) on API error response and calls onError', async () => {
      const fetchResponse: ApiResponse<Todo[]> = { data: [fakeTodo], success: true };
      const onError = vi.fn();

      vi.spyOn(globalThis, 'fetch')
        .mockResolvedValueOnce(new Response(JSON.stringify(fetchResponse), { status: 200 }))
        .mockResolvedValueOnce(new Response('Internal Server Error', { status: 500 }));

      const ref = renderHookWithOptions({ onError });

      await waitFor(() => {
        expect(screen.queryByTestId('loading')).toBeNull();
      });

      await act(async () => {
        await ref.current!.deleteTodo('abc123');
      });

      expect(screen.getByTestId('count').textContent).toBe('1');
      expect(ref.current!.todos[0].id).toBe('abc123');
      expect(onError).toHaveBeenCalledWith("Couldn't delete task. Try again.");
    });

    it('rolls back on network error and calls onError', async () => {
      const fetchResponse: ApiResponse<Todo[]> = { data: [fakeTodo], success: true };
      const onError = vi.fn();

      vi.spyOn(globalThis, 'fetch')
        .mockResolvedValueOnce(new Response(JSON.stringify(fetchResponse), { status: 200 }))
        .mockRejectedValueOnce(new Error('Network error'));

      const ref = renderHookWithOptions({ onError });

      await waitFor(() => {
        expect(screen.queryByTestId('loading')).toBeNull();
      });

      await act(async () => {
        await ref.current!.deleteTodo('abc123');
      });

      expect(screen.getByTestId('count').textContent).toBe('1');
      expect(ref.current!.todos[0].id).toBe('abc123');
      expect(onError).toHaveBeenCalledWith("Couldn't delete task. Try again.");
    });

    it('does nothing for non-existent todo id', async () => {
      const fetchResponse: ApiResponse<Todo[]> = { data: [fakeTodo], success: true };

      vi.spyOn(globalThis, 'fetch')
        .mockResolvedValueOnce(new Response(JSON.stringify(fetchResponse), { status: 200 }));

      const ref = renderHook();

      await waitFor(() => {
        expect(screen.queryByTestId('loading')).toBeNull();
      });

      await act(async () => {
        await ref.current!.deleteTodo('non-existent');
      });

      // Todo still present, only initial fetch was called
      expect(screen.getByTestId('count').textContent).toBe('1');
      expect(globalThis.fetch).toHaveBeenCalledTimes(1);
    });
  });
});
