'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { Todo, ApiResponse } from '@/lib/types';

export interface UseTodosOptions {
  onError?: (message: string) => void;
}

export interface UseTodosReturn {
  todos: Todo[];
  isLoading: boolean;
  error: string | null;
  retry: () => void;
  addTodo: (title: string) => Promise<void>;
  toggleTodo: (id: string) => Promise<void>;
  updateTodo: (id: string, title: string) => Promise<void>;
  deleteTodo: (id: string) => Promise<void>;
}

export function useTodos(options?: UseTodosOptions): UseTodosReturn {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fetchKey, setFetchKey] = useState(0);
  const todosRef = useRef(todos);
  todosRef.current = todos;

  const retry = useCallback(() => {
    setError(null);
    setIsLoading(true);
    setFetchKey(k => k + 1);
  }, []);

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
  }, [fetchKey]);

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
        options?.onError?.("Couldn't add task. Try again.");
        return;
      }
      const json: ApiResponse<Todo> = await res.json();

      if (json.success && json.data) {
        setTodos((prev) => prev.map((t) => (t.id === tempId ? json.data! : t)));
      } else {
        setTodos((prev) => prev.filter((t) => t.id !== tempId));
        options?.onError?.("Couldn't add task. Try again.");
      }
    } catch {
      setTodos((prev) => prev.filter((t) => t.id !== tempId));
      options?.onError?.("Couldn't add task. Try again.");
    }
  }, [options?.onError]);

  const toggleTodo = useCallback(async (id: string) => {
    const todo = todosRef.current.find((t) => t.id === id);
    if (!todo) return;

    const savedTodo = { ...todo };
    const newCompleted = !todo.completed;

    // Optimistic update
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: newCompleted } : t)),
    );

    try {
      const res = await fetch(`/api/todos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: newCompleted }),
      });

      if (!res.ok) {
        setTodos((prev) => prev.map((t) => (t.id === id ? savedTodo : t)));
        options?.onError?.("Couldn't update task. Try again.");
        return;
      }

      const json: ApiResponse<Todo> = await res.json();

      if (json.success && json.data) {
        setTodos((prev) =>
          prev.map((t) => (t.id === id ? json.data! : t)),
        );
      } else {
        setTodos((prev) => prev.map((t) => (t.id === id ? savedTodo : t)));
        options?.onError?.("Couldn't update task. Try again.");
      }
    } catch {
      setTodos((prev) => prev.map((t) => (t.id === id ? savedTodo : t)));
      options?.onError?.("Couldn't update task. Try again.");
    }
  }, [options?.onError]);

  const updateTodo = useCallback(async (id: string, title: string) => {
    const todo = todosRef.current.find((t) => t.id === id);
    if (!todo) return;

    const savedTodo = { ...todo };

    // Optimistic update
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, title } : t)),
    );

    try {
      const res = await fetch(`/api/todos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title }),
      });

      if (!res.ok) {
        setTodos((prev) => prev.map((t) => (t.id === id ? savedTodo : t)));
        options?.onError?.("Couldn't save edit. Try again.");
        return;
      }

      const json: ApiResponse<Todo> = await res.json();

      if (json.success && json.data) {
        setTodos((prev) =>
          prev.map((t) => (t.id === id ? json.data! : t)),
        );
      } else {
        setTodos((prev) => prev.map((t) => (t.id === id ? savedTodo : t)));
        options?.onError?.("Couldn't save edit. Try again.");
      }
    } catch {
      setTodos((prev) => prev.map((t) => (t.id === id ? savedTodo : t)));
      options?.onError?.("Couldn't save edit. Try again.");
    }
  }, [options?.onError]);

  const deleteTodo = useCallback(async (id: string) => {
    const todo = todosRef.current.find((t) => t.id === id);
    if (!todo) return;

    const savedTodos = todosRef.current;

    // Optimistic removal
    setTodos((prev) => prev.filter((t) => t.id !== id));

    try {
      const res = await fetch(`/api/todos/${id}`, { method: 'DELETE' });

      if (!res.ok) {
        setTodos(savedTodos);
        options?.onError?.("Couldn't delete task. Try again.");
      }
    } catch {
      setTodos(savedTodos);
      options?.onError?.("Couldn't delete task. Try again.");
    }
  }, [options?.onError]);

  return { todos, isLoading, error, retry, addTodo, toggleTodo, updateTodo, deleteTodo };
}
