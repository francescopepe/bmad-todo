import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { TodoList } from '@/components/TodoList';
import type { Todo } from '@/lib/types';

afterEach(() => {
  cleanup();
});

const activeTodo: Todo = {
  id: '1',
  title: 'Active task',
  completed: false,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

const completedTodo: Todo = {
  id: '2',
  title: 'Done task',
  completed: true,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

describe('TodoList', () => {
  it('renders a list of todos', () => {
    render(<TodoList todos={[activeTodo, completedTodo]} />);

    expect(screen.getByText('Active task')).toBeDefined();
    expect(screen.getByText('Done task')).toBeDefined();
  });

  it('renders an empty list when no todos provided', () => {
    const { container } = render(<TodoList todos={[]} />);

    const list = container.querySelector('ul');
    expect(list).toBeDefined();
    expect(list!.children.length).toBe(0);
  });

  it('renders checkboxes for each todo', () => {
    render(<TodoList todos={[activeTodo, completedTodo]} />);

    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes.length).toBe(2);
  });

  it('shows completed todo with checked checkbox', () => {
    render(<TodoList todos={[completedTodo]} />);

    const checkbox = screen.getByRole('checkbox') as HTMLInputElement;
    expect(checkbox.checked).toBe(true);
  });

  it('shows active todo with unchecked checkbox', () => {
    render(<TodoList todos={[activeTodo]} />);

    const checkbox = screen.getByRole('checkbox') as HTMLInputElement;
    expect(checkbox.checked).toBe(false);
  });

  it('applies line-through style to completed todos', () => {
    render(<TodoList todos={[completedTodo]} />);

    const text = screen.getByText('Done task');
    expect(text.className).toContain('line-through');
  });
});
