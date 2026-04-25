import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act, cleanup } from '@testing-library/react';
import { Toast } from '@/components/Toast';
import type { ToastItem } from '@/components/Toast';

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
  cleanup();
});

describe('Toast', () => {
  it('renders nothing when toasts array is empty', () => {
    const { container } = render(<Toast toasts={[]} onDismiss={vi.fn()} />);
    expect(container.innerHTML).toBe('');
  });

  it('renders a single toast with correct message text', () => {
    const toasts: ToastItem[] = [{ id: 1, message: "Couldn't add task. Try again." }];
    render(<Toast toasts={toasts} onDismiss={vi.fn()} />);
    expect(screen.getByText("Couldn't add task. Try again.")).toBeDefined();
  });

  it('renders multiple toasts simultaneously', () => {
    const toasts: ToastItem[] = [
      { id: 1, message: 'Error one' },
      { id: 2, message: 'Error two' },
      { id: 3, message: 'Error three' },
    ];
    render(<Toast toasts={toasts} onDismiss={vi.fn()} />);
    expect(screen.getByText('Error one')).toBeDefined();
    expect(screen.getByText('Error two')).toBeDefined();
    expect(screen.getByText('Error three')).toBeDefined();
  });

  it('each toast has role="alert"', () => {
    const toasts: ToastItem[] = [
      { id: 1, message: 'Alert one' },
      { id: 2, message: 'Alert two' },
    ];
    render(<Toast toasts={toasts} onDismiss={vi.fn()} />);
    const alerts = screen.getAllByRole('alert');
    expect(alerts).toHaveLength(2);
  });

  it('calls onDismiss with correct id after auto-dismiss timer', () => {
    const onDismiss = vi.fn();
    const toasts: ToastItem[] = [{ id: 42, message: 'Auto dismiss me' }];
    render(<Toast toasts={toasts} onDismiss={onDismiss} />);

    // Advance past the 4s auto-dismiss + 200ms slide-out
    act(() => {
      vi.advanceTimersByTime(4200);
    });

    expect(onDismiss).toHaveBeenCalledWith(42);
  });

  it('each toast has aria-live="polite"', () => {
    const toasts: ToastItem[] = [
      { id: 1, message: 'Alert one' },
    ];
    render(<Toast toasts={toasts} onDismiss={vi.fn()} />);
    const alert = screen.getByRole('alert');
    expect(alert.getAttribute('aria-live')).toBe('polite');
  });

  it('toast container uses mobile-first center positioning with md: desktop override', () => {
    const toasts: ToastItem[] = [{ id: 1, message: 'Position test' }];
    const { container } = render(<Toast toasts={toasts} onDismiss={vi.fn()} />);
    const wrapper = container.firstElementChild as HTMLElement;
    expect(wrapper.className).toContain('fixed');
    expect(wrapper.className).toContain('bottom-4');
    // Mobile-first: centered by default
    expect(wrapper.className).toContain('left-1/2');
    expect(wrapper.className).toContain('-translate-x-1/2');
    // Desktop: right-aligned with md: prefix
    expect(wrapper.className).toContain('md:left-auto');
    expect(wrapper.className).toContain('md:right-4');
    expect(wrapper.className).toContain('md:translate-x-0');
    expect(wrapper.className).toContain('z-50');
    expect(wrapper.className).toContain('flex');
    expect(wrapper.className).toContain('flex-col');
    expect(wrapper.className).toContain('gap-2');
  });
});
