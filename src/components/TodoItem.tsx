import { useState, useRef, useEffect } from 'react';
import type { Todo } from '@/lib/types';

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onEdit: (id: string, title: string) => void;
  onDelete: (id: string) => void;
}

export function TodoItem({ todo, onToggle, onEdit, onDelete }: TodoItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(todo.title);
  const inputRef = useRef<HTMLInputElement>(null);
  const escapePressedRef = useRef(false);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const enterEditMode = () => {
    setEditText(todo.title);
    escapePressedRef.current = false;
    setIsEditing(true);
  };

  const saveEdit = () => {
    const trimmed = editText.trim();
    if (trimmed && trimmed !== todo.title) {
      onEdit(todo.id, trimmed);
    }
    setIsEditing(false);
  };

  const cancelEdit = () => {
    setEditText(todo.title);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      saveEdit();
    } else if (e.key === 'Escape') {
      escapePressedRef.current = true;
      cancelEdit();
    }
  };

  const handleBlur = () => {
    if (escapePressedRef.current) {
      escapePressedRef.current = false;
      return;
    }
    saveEdit();
  };

  const label = todo.completed
    ? `Mark "${todo.title}" as active`
    : `Mark "${todo.title}" as complete`;

  return (
    <li className="group flex items-center gap-3 py-2">
      <label className="min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer">
        <input
          type="checkbox"
          checked={todo.completed}
          onChange={() => onToggle(todo.id)}
          aria-label={label}
          className="h-4 w-4 rounded border-border focus:ring-2 focus:ring-primary"
        />
      </label>
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={editText}
          maxLength={500}
          onChange={(e) => setEditText(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          className="flex-1 rounded border border-border px-2 py-1 text-text-primary outline-none focus:border-primary focus:ring-2 focus:ring-primary"
        />
      ) : (
        <>
          <span
            onClick={enterEditMode}
            className={`flex-1 cursor-pointer transition-colors duration-200 ease ${
              todo.completed
                ? 'line-through text-text-completed'
                : 'text-text-primary'
            }`}
          >
            {todo.title}
          </span>
          <div className="flex gap-2 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100 [@media(hover:hover)]:focus-within:opacity-100 transition-opacity duration-200">
            <button
              onClick={enterEditMode}
              className="min-h-[44px] min-w-[44px] rounded border border-text-secondary bg-transparent px-3 py-1 text-[0.875rem] font-medium text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary"
            >
              Edit
            </button>
            <button
              onClick={() => onDelete(todo.id)}
              className="min-h-[44px] min-w-[44px] rounded border border-text-secondary bg-transparent px-3 py-1 text-[0.875rem] font-medium text-text-secondary hover:text-error-hover hover:border-error-hover focus:outline-none focus:ring-2 focus:ring-primary"
            >
              Delete
            </button>
          </div>
        </>
      )}
    </li>
  );
}
