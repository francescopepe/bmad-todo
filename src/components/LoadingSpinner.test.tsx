import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { LoadingSpinner } from '@/components/LoadingSpinner';

afterEach(() => {
  cleanup();
});

describe('LoadingSpinner', () => {
  it('renders with correct aria-label', () => {
    render(<LoadingSpinner />);
    expect(screen.getByLabelText('Loading tasks')).toBeDefined();
  });

  it('has role="status" for screen reader announcement', () => {
    render(<LoadingSpinner />);
    expect(screen.getByRole('status')).toBeDefined();
  });

  it('aria-label is "Loading tasks"', () => {
    render(<LoadingSpinner />);
    const spinner = screen.getByRole('status');
    expect(spinner.getAttribute('aria-label')).toBe('Loading tasks');
  });
});
