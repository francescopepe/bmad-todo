import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { EmptyState } from '@/components/EmptyState';

afterEach(() => {
  cleanup();
});

describe('EmptyState', () => {
  it('renders "No todos yet" message', () => {
    render(<EmptyState />);
    expect(screen.getByText('No todos yet')).toBeDefined();
  });
});
