'use client';

import { useState, useCallback, useRef } from 'react';
import { useTodos } from '@/hooks/useTodos';
import { TodoForm } from '@/components/TodoForm';
import { TodoList } from '@/components/TodoList';
import { EmptyState } from '@/components/EmptyState';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Toast } from '@/components/Toast';
import type { ToastItem } from '@/components/Toast';

export default function Home() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextId = useRef(0);
  const addToast = useCallback((message: string) => {
    setToasts(prev => [...prev, { id: nextId.current++, message }]);
  }, []);
  const removeToast = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const { todos, isLoading, error, addTodo, toggleTodo, updateTodo, deleteTodo } = useTodos({ onError: addToast });

  return (
    <main className="mx-auto max-w-[640px] px-4 md:px-8 py-8 md:py-12">
      <h1 className="text-2xl font-bold text-text-primary mb-6 md:mb-8">
        Awesome Todo
      </h1>

      {isLoading ? (
        <LoadingSpinner />
      ) : error ? (
        <p className="text-center text-error py-12">{error}</p>
      ) : (
        <>
          <TodoForm onAddTodo={addTodo} />
          {todos.length === 0 ? (
            <EmptyState />
          ) : (
            <TodoList todos={todos} onToggle={toggleTodo} onEdit={updateTodo} onDelete={deleteTodo} />
          )}
        </>
      )}

      <Toast toasts={toasts} onDismiss={removeToast} />
    </main>
  );
}
