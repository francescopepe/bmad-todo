'use client';

import { useState, useRef, type FormEvent } from 'react';

interface TodoFormProps {
  onAddTodo: (title: string) => void;
}

export function TodoForm({ onAddTodo }: TodoFormProps) {
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = value.trim();
    if (trimmed.length === 0) return;
    onAddTodo(trimmed);
    setValue('');
    inputRef.current?.focus();
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-3 mb-6">
      <label htmlFor="todo-input" className="sr-only">
        Add a new task
      </label>
      <input
        ref={inputRef}
        id="todo-input"
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Add a new task..."
        maxLength={500}
        className="flex-1 text-base border-0 border-b border-border focus:border-primary focus:ring-2 focus:ring-primary outline-none py-2 min-h-[44px] bg-transparent text-text-primary placeholder:text-text-secondary"
        autoFocus
      />
      <button
        type="submit"
        className="bg-primary text-white px-4 py-2 min-h-[44px] rounded font-medium hover:bg-primary-hover transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
      >
        Add
      </button>
    </form>
  );
}
