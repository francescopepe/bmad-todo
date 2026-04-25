import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import { TodoItem } from '@/components/TodoItem';
import type { Todo } from '@/lib/types';

afterEach(() => {
  cleanup();
});

const activeTodo: Todo = {
  id: '1',
  title: 'Buy groceries',
  completed: false,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

const completedTodo: Todo = {
  id: '2',
  title: 'Walk the dog',
  completed: true,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

const noop = () => {};

describe('TodoItem', () => {
  it('renders active todo with normal text styling (no strikethrough)', () => {
    render(<TodoItem todo={activeTodo} onToggle={noop} onEdit={noop} onDelete={noop} />);

    const text = screen.getByText('Buy groceries');
    expect(text.className).not.toContain('line-through');
    expect(text.className).toContain('text-text-primary');
  });

  it('renders completed todo with strikethrough and muted color class', () => {
    render(<TodoItem todo={completedTodo} onToggle={noop} onEdit={noop} onDelete={noop} />);

    const text = screen.getByText('Walk the dog');
    expect(text.className).toContain('line-through');
    expect(text.className).toContain('text-text-completed');
  });

  it('calls onToggle with todo.id when checkbox is clicked', () => {
    const onToggle = vi.fn();
    render(<TodoItem todo={activeTodo} onToggle={onToggle} onEdit={noop} onDelete={noop} />);

    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);

    expect(onToggle).toHaveBeenCalledTimes(1);
    expect(onToggle).toHaveBeenCalledWith('1');
  });

  it('checkbox has correct aria-label including task text', () => {
    render(<TodoItem todo={activeTodo} onToggle={noop} onEdit={noop} onDelete={noop} />);

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox.getAttribute('aria-label')).toBe(
      'Mark "Buy groceries" as complete',
    );
  });

  it('checkbox aria-label says "as active" for completed todo', () => {
    render(<TodoItem todo={completedTodo} onToggle={noop} onEdit={noop} onDelete={noop} />);

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox.getAttribute('aria-label')).toBe(
      'Mark "Walk the dog" as active',
    );
  });

  it('checkbox reflects todo.completed state — unchecked for active', () => {
    render(<TodoItem todo={activeTodo} onToggle={noop} onEdit={noop} onDelete={noop} />);

    const checkbox = screen.getByRole('checkbox') as HTMLInputElement;
    expect(checkbox.checked).toBe(false);
  });

  it('checkbox reflects todo.completed state — checked for completed', () => {
    render(<TodoItem todo={completedTodo} onToggle={noop} onEdit={noop} onDelete={noop} />);

    const checkbox = screen.getByRole('checkbox') as HTMLInputElement;
    expect(checkbox.checked).toBe(true);
  });

  it('has transition classes for smooth visual change', () => {
    render(<TodoItem todo={activeTodo} onToggle={noop} onEdit={noop} onDelete={noop} />);

    const text = screen.getByText('Buy groceries');
    expect(text.className).toContain('transition-colors');
    expect(text.className).toContain('duration-200');
  });

  describe('edit mode', () => {
    it('clicking Edit button enters edit mode (input appears with current text)', () => {
      render(<TodoItem todo={activeTodo} onToggle={noop} onEdit={noop} onDelete={noop} />);

      fireEvent.click(screen.getByRole('button', { name: 'Edit' }));

      const input = screen.getByRole('textbox') as HTMLInputElement;
      expect(input.value).toBe('Buy groceries');
      expect(screen.queryByText('Buy groceries')).toBeNull();
    });

    it('clicking task text enters edit mode', () => {
      render(<TodoItem todo={activeTodo} onToggle={noop} onEdit={noop} onDelete={noop} />);

      fireEvent.click(screen.getByText('Buy groceries'));

      const input = screen.getByRole('textbox') as HTMLInputElement;
      expect(input.value).toBe('Buy groceries');
    });

    it('input is auto-focused on entering edit mode', () => {
      render(<TodoItem todo={activeTodo} onToggle={noop} onEdit={noop} onDelete={noop} />);

      fireEvent.click(screen.getByRole('button', { name: 'Edit' }));

      const input = screen.getByRole('textbox');
      expect(document.activeElement).toBe(input);
    });

    it('pressing Enter calls onEdit with the todo id and new title', () => {
      const onEdit = vi.fn();
      render(<TodoItem todo={activeTodo} onToggle={noop} onEdit={onEdit} onDelete={noop} />);

      fireEvent.click(screen.getByRole('button', { name: 'Edit' }));
      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'Buy milk' } });
      fireEvent.keyDown(input, { key: 'Enter' });

      expect(onEdit).toHaveBeenCalledWith('1', 'Buy milk');
      expect(screen.queryByRole('textbox')).toBeNull();
    });

    it('blur saves the edit (calls onEdit)', () => {
      const onEdit = vi.fn();
      render(<TodoItem todo={activeTodo} onToggle={noop} onEdit={onEdit} onDelete={noop} />);

      fireEvent.click(screen.getByRole('button', { name: 'Edit' }));
      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'Buy milk' } });
      fireEvent.blur(input);

      expect(onEdit).toHaveBeenCalledWith('1', 'Buy milk');
      expect(screen.queryByRole('textbox')).toBeNull();
    });

    it('pressing Escape reverts text and exits edit mode without calling onEdit', () => {
      const onEdit = vi.fn();
      render(<TodoItem todo={activeTodo} onToggle={noop} onEdit={onEdit} onDelete={noop} />);

      fireEvent.click(screen.getByRole('button', { name: 'Edit' }));
      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'Something else' } });
      fireEvent.keyDown(input, { key: 'Escape' });

      expect(onEdit).not.toHaveBeenCalled();
      expect(screen.queryByRole('textbox')).toBeNull();
      expect(screen.getByText('Buy groceries')).toBeDefined();
    });

    it('empty/whitespace-only text is treated as cancel (no onEdit call)', () => {
      const onEdit = vi.fn();
      render(<TodoItem todo={activeTodo} onToggle={noop} onEdit={onEdit} onDelete={noop} />);

      fireEvent.click(screen.getByRole('button', { name: 'Edit' }));
      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: '   ' } });
      fireEvent.keyDown(input, { key: 'Enter' });

      expect(onEdit).not.toHaveBeenCalled();
    });

    it('unchanged text is treated as cancel (no onEdit call)', () => {
      const onEdit = vi.fn();
      render(<TodoItem todo={activeTodo} onToggle={noop} onEdit={onEdit} onDelete={noop} />);

      fireEvent.click(screen.getByRole('button', { name: 'Edit' }));
      const input = screen.getByRole('textbox');
      fireEvent.keyDown(input, { key: 'Enter' });

      expect(onEdit).not.toHaveBeenCalled();
    });

    it('Edit button has accessible "Edit" text label', () => {
      render(<TodoItem todo={activeTodo} onToggle={noop} onEdit={noop} onDelete={noop} />);

      const button = screen.getByRole('button', { name: 'Edit' });
      expect(button).toBeDefined();
      expect(button.textContent).toBe('Edit');
    });
  });

  describe('touch targets and responsive classes', () => {
    it('checkbox wrapper has min 44x44px touch target', () => {
      render(<TodoItem todo={activeTodo} onToggle={noop} onEdit={noop} onDelete={noop} />);

      const checkbox = screen.getByRole('checkbox');
      const wrapper = checkbox.closest('label')!;
      expect(wrapper).toBeDefined();
      expect(wrapper.className).toContain('min-h-[44px]');
      expect(wrapper.className).toContain('min-w-[44px]');
    });

    it('Edit button has min 44x44px touch target', () => {
      render(<TodoItem todo={activeTodo} onToggle={noop} onEdit={noop} onDelete={noop} />);

      const button = screen.getByRole('button', { name: 'Edit' });
      expect(button.className).toContain('min-h-[44px]');
      expect(button.className).toContain('min-w-[44px]');
    });

    it('Delete button has min 44x44px touch target', () => {
      render(<TodoItem todo={activeTodo} onToggle={noop} onEdit={noop} onDelete={noop} />);

      const button = screen.getByRole('button', { name: 'Delete' });
      expect(button.className).toContain('min-h-[44px]');
      expect(button.className).toContain('min-w-[44px]');
    });

    it('action buttons container has hover-reveal classes', () => {
      render(<TodoItem todo={activeTodo} onToggle={noop} onEdit={noop} onDelete={noop} />);

      const editBtn = screen.getByRole('button', { name: 'Edit' });
      const container = editBtn.parentElement!;
      expect(container.className).toContain('[@media(hover:hover)]:opacity-0');
      expect(container.className).toContain('[@media(hover:hover)]:group-hover:opacity-100');
      expect(container.className).toContain('[@media(hover:hover)]:focus-within:opacity-100');
    });
  });

  describe('delete button', () => {
    it('renders Delete button with accessible "Delete" text label', () => {
      render(<TodoItem todo={activeTodo} onToggle={noop} onEdit={noop} onDelete={noop} />);

      const button = screen.getByRole('button', { name: 'Delete' });
      expect(button).toBeDefined();
      expect(button.textContent).toBe('Delete');
    });

    it('clicking Delete button calls onDelete with todo.id', () => {
      const onDelete = vi.fn();
      render(<TodoItem todo={activeTodo} onToggle={noop} onEdit={noop} onDelete={onDelete} />);

      fireEvent.click(screen.getByRole('button', { name: 'Delete' }));

      expect(onDelete).toHaveBeenCalledTimes(1);
      expect(onDelete).toHaveBeenCalledWith('1');
    });

    it('Delete button is NOT visible in edit mode', () => {
      render(<TodoItem todo={activeTodo} onToggle={noop} onEdit={noop} onDelete={noop} />);

      fireEvent.click(screen.getByRole('button', { name: 'Edit' }));

      expect(screen.queryByRole('button', { name: 'Delete' })).toBeNull();
    });

    it('Delete button has destructive hover styling classes', () => {
      render(<TodoItem todo={activeTodo} onToggle={noop} onEdit={noop} onDelete={noop} />);

      const button = screen.getByRole('button', { name: 'Delete' });
      expect(button.className).toContain('hover:text-error-hover');
      expect(button.className).toContain('hover:border-error-hover');
    });
  });

  describe('accessibility — focus rings and semantic HTML', () => {
    it('checkbox has focus ring classes', () => {
      render(<TodoItem todo={activeTodo} onToggle={noop} onEdit={noop} onDelete={noop} />);

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox.className).toContain('focus:ring-2');
      expect(checkbox.className).toContain('focus:ring-primary');
    });

    it('Edit button has focus ring classes', () => {
      render(<TodoItem todo={activeTodo} onToggle={noop} onEdit={noop} onDelete={noop} />);

      const button = screen.getByRole('button', { name: 'Edit' });
      expect(button.className).toContain('focus:ring-2');
      expect(button.className).toContain('focus:ring-primary');
      expect(button.className).toContain('focus:outline-none');
    });

    it('Delete button has focus ring classes', () => {
      render(<TodoItem todo={activeTodo} onToggle={noop} onEdit={noop} onDelete={noop} />);

      const button = screen.getByRole('button', { name: 'Delete' });
      expect(button.className).toContain('focus:ring-2');
      expect(button.className).toContain('focus:ring-primary');
      expect(button.className).toContain('focus:outline-none');
    });

    it('edit mode input has focus ring classes', () => {
      render(<TodoItem todo={activeTodo} onToggle={noop} onEdit={noop} onDelete={noop} />);

      fireEvent.click(screen.getByRole('button', { name: 'Edit' }));
      const input = screen.getByRole('textbox');
      expect(input.className).toContain('focus:ring-2');
      expect(input.className).toContain('focus:ring-primary');
    });

    it('renders as a <li> element', () => {
      render(<TodoItem todo={activeTodo} onToggle={noop} onEdit={noop} onDelete={noop} />);

      const listItem = screen.getByRole('listitem');
      expect(listItem).toBeDefined();
    });

    it('checkbox aria-label includes task text', () => {
      render(<TodoItem todo={activeTodo} onToggle={noop} onEdit={noop} onDelete={noop} />);

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox.getAttribute('aria-label')).toContain('Buy groceries');
    });
  });
});
