/**
 * Error Boundary for the map and MCP layers.
 *
 * Catches render-time errors (e.g. Google Maps API failures, malformed MCP
 * responses) and displays a user-friendly error state instead of crashing.
 */

import { Component, type ErrorInfo, type ReactNode } from 'react';
import './ErrorBoundary.css';

export interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, info: ErrorInfo) => void;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ error, errorInfo });
    this.props.onError?.(error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return <>{this.props.fallback}</>;
      }

      const { error, errorInfo } = this.state;
      return (
        <div className="error-boundary">
          <div className="error-boundary__icon" role="img" aria-label="error">
            ⚠️
          </div>
          <h2 className="error-boundary__title">Something went wrong</h2>
          <p className="error-boundary__message">
            {error?.message ?? 'An unexpected error occurred while rendering the map.'}
          </p>
          {import.meta.env.DEV && errorInfo && (
            <pre className="error-boundary__details">{errorInfo.componentStack}</pre>
          )}
          <button className="error-boundary__retry" onClick={this.handleReset}>
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
