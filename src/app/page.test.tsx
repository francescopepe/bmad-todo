import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { render, screen, act, cleanup } from '@testing-library/react';
import Home from '@/app/page';
import type { UseTodosReturn } from '@/hooks/useTodos';
import type { Todo } from '@/lib/types';

const mockUseTodos = vi.fn<() => UseTodosReturn>();

vi.mock('@/hooks/useTodos', () => ({
  useTodos: (...args: unknown[]) => mockUseTodos(...(args as [])),
}));

const fakeTodo: Todo = {
  id: 'abc123',
  title: 'Test task',
  completed: false,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

function makeHookReturn(overrides: Partial<UseTodosReturn> = {}): UseTodosReturn {
  return {
    todos: [],
    isLoading: false,
    error: null,
    retry: vi.fn(),
    addTodo: vi.fn(),
    toggleTodo: vi.fn(),
    updateTodo: vi.fn(),
    deleteTodo: vi.fn(),
    ...overrides,
  };
}

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
  cleanup();
  vi.restoreAllMocks();
});

describe('Home page', () => {
  it('shows LoadingSpinner when isLoading is true', () => {
    mockUseTodos.mockReturnValue(makeHookReturn({ isLoading: true }));
    render(<Home />);
    expect(screen.getByLabelText('Loading tasks')).toBeDefined();
  });

  it('shows EmptyState when todos array is empty and not loading', () => {
    mockUseTodos.mockReturnValue(makeHookReturn({ todos: [] }));
    render(<Home />);
    expect(screen.getByText('No todos yet')).toBeDefined();
  });

  it('renders TodoForm when not loading and no error', () => {
    mockUseTodos.mockReturnValue(makeHookReturn());
    render(<Home />);
    expect(screen.getByPlaceholderText('Add a new task...')).toBeDefined();
  });

  it('renders TodoList when todos exist', () => {
    mockUseTodos.mockReturnValue(makeHookReturn({ todos: [fakeTodo] }));
    render(<Home />);
    expect(screen.getByText('Test task')).toBeDefined();
  });

  it('shows error message when error state is set', () => {
    mockUseTodos.mockReturnValue(makeHookReturn({ error: 'Failed to load todos' }));
    render(<Home />);
    expect(screen.getByText('Failed to load todos')).toBeDefined();
  });

  it('does not show TodoForm or EmptyState when in error state', () => {
    mockUseTodos.mockReturnValue(makeHookReturn({ error: 'Failed to load todos' }));
    render(<Home />);
    expect(screen.queryByPlaceholderText('Add a new task...')).toBeNull();
  });

  it('shows retry button when error state is set', () => {
    mockUseTodos.mockReturnValue(makeHookReturn({ error: 'Failed to load todos' }));
    render(<Home />);
    expect(screen.getByRole('button', { name: 'Retry' })).toBeDefined();
  });

  it('calls retry when retry button is clicked', () => {
    const retryFn = vi.fn();
    mockUseTodos.mockReturnValue(makeHookReturn({ error: 'Failed to load todos', retry: retryFn }));
    render(<Home />);
    screen.getByRole('button', { name: 'Retry' }).click();
    expect(retryFn).toHaveBeenCalled();
  });

  it('shows toast when onError callback fires', () => {
    let capturedOnError: ((msg: string) => void) | undefined;
    mockUseTodos.mockImplementation(((options?: { onError?: (msg: string) => void }) => {
      capturedOnError = options?.onError;
      return makeHookReturn();
    }) as () => UseTodosReturn);

    render(<Home />);
    expect(capturedOnError).toBeDefined();

    act(() => {
      capturedOnError!("Couldn't add task. Try again.");
    });

    expect(screen.getByText("Couldn't add task. Try again.")).toBeDefined();
  });

  it('caps toasts at 5 entries', () => {
    let capturedOnError: ((msg: string) => void) | undefined;
    mockUseTodos.mockImplementation(((options?: { onError?: (msg: string) => void }) => {
      capturedOnError = options?.onError;
      return makeHookReturn();
    }) as () => UseTodosReturn);

    render(<Home />);

    act(() => {
      for (let i = 0; i < 7; i++) {
        capturedOnError!(`Error ${i}`);
      }
    });

    const alerts = screen.getAllByRole('alert');
    expect(alerts.length).toBe(5);
  });

  it('renders page heading', () => {
    mockUseTodos.mockReturnValue(makeHookReturn());
    render(<Home />);
    expect(screen.getByRole('heading', { level: 1 })).toBeDefined();
    expect(screen.getByText('Awesome Todo')).toBeDefined();
  });
});
