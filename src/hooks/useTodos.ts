'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Todo, ApiResponse } from '@/lib/types';

export interface UseTodosReturn {
  todos: Todo[];
  isLoading: boolean;
  error: string | null;
  addTodo: (title: string) => Promise<void>;
  toggleTodo: (id: string) => Promise<void>;
  updateTodo: (id: string, title: string) => Promise<void>;
  deleteTodo: (id: string) => Promise<void>;
}

export function useTodos(): UseTodosReturn {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchTodos() {
      try {
        const res = await fetch('/api/todos');
        if (!res.ok) {
          if (!cancelled) setError('Failed to load todos');
          return;
        }
        const json: ApiResponse<Todo[]> = await res.json();

        if (cancelled) return;

        if (json.success && json.data) {
          setTodos(json.data);
        } else {
          setError('Failed to load todos');
        }
      } catch {
        if (!cancelled) {
          setError('Failed to load todos');
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    fetchTodos();
    return () => { cancelled = true; };
  }, []);

  const addTodo = useCallback(async (title: string) => {
    const tempId = `temp-${Date.now()}`;
    const optimisticTodo: Todo = {
      id: tempId,
      title,
      completed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setTodos((prev) => [optimisticTodo, ...prev]);

    try {
      const res = await fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title }),
      });
      if (!res.ok) {
        setTodos((prev) => prev.filter((t) => t.id !== tempId));
        return;
      }
      const json: ApiResponse<Todo> = await res.json();

      if (json.success && json.data) {
        setTodos((prev) => prev.map((t) => (t.id === tempId ? json.data! : t)));
      } else {
        setTodos((prev) => prev.filter((t) => t.id !== tempId));
      }
    } catch {
      setTodos((prev) => prev.filter((t) => t.id !== tempId));
    }
  }, []);

  // Stubs — implemented in Epic 2
  const toggleTodo: UseTodosReturn['toggleTodo'] = useCallback(async () => {}, []);
  const updateTodo: UseTodosReturn['updateTodo'] = useCallback(async () => {}, []);
  const deleteTodo: UseTodosReturn['deleteTodo'] = useCallback(async () => {}, []);

  return { todos, isLoading, error, addTodo, toggleTodo, updateTodo, deleteTodo };
}
