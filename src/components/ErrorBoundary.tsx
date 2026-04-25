'use client';

import { Component } from 'react';
import type { ReactNode, ErrorInfo } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: unknown, errorInfo: ErrorInfo): void {
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught:', error, errorInfo);
    }
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <main
          role="alert"
          className="flex flex-1 flex-col items-center justify-center bg-background px-4"
        >
          <h1 className="text-text-primary text-lg font-semibold mb-2">
            Something went wrong. Please try again.
          </h1>
          <button
            type="button"
            aria-label="Reload"
            onClick={() => window.location.reload()}
            autoFocus
            className="mt-4 min-h-[44px] min-w-[44px] rounded bg-primary px-4 py-2 text-[0.875rem] font-medium text-white transition-colors duration-200 ease hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary"
          >
            Reload
          </button>
        </main>
      );
    }

    return this.props.children;
  }
}
