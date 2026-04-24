import type { Todo } from '@/lib/types';

interface TodoListProps {
  todos: Todo[];
}

export function TodoList({ todos }: TodoListProps) {
  return (
    <ul className="space-y-1">
      {todos.map((todo) => (
        <li key={todo.id} className="flex items-center gap-3 py-2">
          <input
            type="checkbox"
            checked={todo.completed}
            disabled
            className="h-4 w-4 rounded border-border"
          />
          <span
            className={
              todo.completed
                ? 'line-through text-text-completed'
                : 'text-text-primary'
            }
          >
            {todo.title}
          </span>
        </li>
      ))}
    </ul>
  );
}
