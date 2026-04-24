import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { TodoForm } from '@/components/TodoForm';

afterEach(() => {
  cleanup();
});

describe('TodoForm', () => {
  it('renders input and Add button', () => {
    render(<TodoForm onAddTodo={vi.fn()} />);

    expect(screen.getByPlaceholderText('Add a new task...')).toBeDefined();
    expect(screen.getByRole('button', { name: 'Add' })).toBeDefined();
  });

  it('has a visually-hidden label for accessibility', () => {
    render(<TodoForm onAddTodo={vi.fn()} />);

    expect(screen.getByLabelText('Add a new task')).toBeDefined();
  });

  it('calls onAddTodo with trimmed title on form submit', () => {
    const onAddTodo = vi.fn();
    render(<TodoForm onAddTodo={onAddTodo} />);

    const input = screen.getByPlaceholderText('Add a new task...');
    fireEvent.change(input, { target: { value: '  Buy groceries  ' } });
    fireEvent.submit(input.closest('form')!);

    expect(onAddTodo).toHaveBeenCalledWith('Buy groceries');
  });

  it('calls onAddTodo when Add button is clicked', () => {
    const onAddTodo = vi.fn();
    render(<TodoForm onAddTodo={onAddTodo} />);

    const input = screen.getByPlaceholderText('Add a new task...');
    fireEvent.change(input, { target: { value: 'New task' } });
    fireEvent.click(screen.getByRole('button', { name: 'Add' }));

    expect(onAddTodo).toHaveBeenCalledWith('New task');
  });

  it('does not call onAddTodo when input is empty', () => {
    const onAddTodo = vi.fn();
    render(<TodoForm onAddTodo={onAddTodo} />);

    fireEvent.submit(screen.getByPlaceholderText('Add a new task...').closest('form')!);

    expect(onAddTodo).not.toHaveBeenCalled();
  });

  it('does not call onAddTodo when input is only whitespace', () => {
    const onAddTodo = vi.fn();
    render(<TodoForm onAddTodo={onAddTodo} />);

    const input = screen.getByPlaceholderText('Add a new task...');
    fireEvent.change(input, { target: { value: '   ' } });
    fireEvent.submit(input.closest('form')!);

    expect(onAddTodo).not.toHaveBeenCalled();
  });

  it('clears input after successful submit', () => {
    const onAddTodo = vi.fn();
    render(<TodoForm onAddTodo={onAddTodo} />);

    const input = screen.getByPlaceholderText('Add a new task...') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'A task' } });
    fireEvent.submit(input.closest('form')!);

    expect(input.value).toBe('');
  });

  it('auto-focuses the input on mount', () => {
    render(<TodoForm onAddTodo={vi.fn()} />);

    const input = screen.getByPlaceholderText('Add a new task...');
    expect(input).toBe(document.activeElement);
  });
});
