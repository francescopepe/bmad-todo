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
});
