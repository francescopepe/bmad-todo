import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import { ErrorBoundary } from '@/components/ErrorBoundary';

beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
  cleanup();
});

function ThrowingComponent(): never {
  throw new Error('Test render error');
}

describe('ErrorBoundary', () => {
  it('renders children when no error occurs', () => {
    render(
      <ErrorBoundary>
        <p>Hello World</p>
      </ErrorBoundary>
    );
    expect(screen.getByText('Hello World')).toBeDefined();
  });

  it('displays fallback UI when a child throws during render', () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent />
      </ErrorBoundary>
    );
    expect(screen.getByText('Something went wrong. Please try again.')).toBeDefined();
  });

  it('displays a Reload button in the fallback UI', () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent />
      </ErrorBoundary>
    );
    expect(screen.getByRole('button', { name: /reload/i })).toBeDefined();
  });

  it('does not show stack traces or technical error details', () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent />
      </ErrorBoundary>
    );
    expect(screen.queryByText('Test render error')).toBeNull();
    expect(screen.queryByText(/Error/)).toBeNull();
    expect(screen.queryByText(/stack/i)).toBeNull();
  });

  it('Reload button calls window.location.reload()', () => {
    const originalLocation = window.location;
    const reloadMock = vi.fn();
    Object.defineProperty(window, 'location', {
      value: { ...window.location, reload: reloadMock },
      writable: true,
    });

    try {
      render(
        <ErrorBoundary>
          <ThrowingComponent />
        </ErrorBoundary>
      );

      fireEvent.click(screen.getByRole('button', { name: /reload/i }));
      expect(reloadMock).toHaveBeenCalledTimes(1);
    } finally {
      Object.defineProperty(window, 'location', {
        value: originalLocation,
        writable: true,
      });
    }
  });

  it('auto-focuses the Reload button when error fallback renders', () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent />
      </ErrorBoundary>
    );
    const reloadButton = screen.getByRole('button', { name: /reload/i });
    expect(document.activeElement).toBe(reloadButton);
  });

  it('has role="alert" on the error container for screen reader announcement', () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent />
      </ErrorBoundary>
    );
    expect(screen.getByRole('alert')).toBeDefined();
  });

  it('Reload button has focus ring classes', () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent />
      </ErrorBoundary>
    );
    const button = screen.getByRole('button', { name: /reload/i });
    expect(button.className).toContain('focus:ring-2');
    expect(button.className).toContain('focus:ring-primary');
    expect(button.className).toContain('focus:outline-none');
  });
});
