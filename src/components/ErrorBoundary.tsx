import React from 'react';

/**
 * Props for ErrorBoundary component
 */
interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onError?: (_error: Error, _info: React.ErrorInfo) => void;
  resetKeys?: Array<string | number>;
}

/**
 * State for ErrorBoundary component
 */
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

/**
 * ErrorBoundary — Catches React errors in descendant components
 *
 * Prevents a single component crash from crashing the entire app.
 * Displays a fallback UI when an error is caught.
 *
 * Usage:
 * ```tsx
 * <ErrorBoundary>
 *   <SomeComponent />
 * </ErrorBoundary>
 * ```
 *
 * With custom fallback:
 * ```tsx
 * <ErrorBoundary fallback={<CustomErrorUI />}>
 *   <SomeComponent />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private resetTimeoutId: NodeJS.Timeout | null = null;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  /**
   * Derived state update when an error is caught
   */
  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  /**
   * Lifecycle method to log error details
   * Implements graceful fallback error logging strategy
   */
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    this.setState({ errorInfo });

    // Call optional error callback from props
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Error logging with graceful fallback strategy
    try {
      // Primary: Log to centralized logging service (if implemented)
      if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
        // Fallback 1: Log to browser console (dev environment)
        console.error('ErrorBoundary caught an error:', error); // eslint-disable-line no-console
        console.error('Error Info:', errorInfo); // eslint-disable-line no-console
      }

      // Fallback 2: Store in sessionStorage (if network unavailable)
      if (typeof window !== 'undefined' && typeof sessionStorage !== 'undefined') {
        const errorLog = {
          timestamp: new Date().toISOString(),
          message: error.message,
          stack: error.stack,
          componentStack: errorInfo.componentStack,
        };
        sessionStorage.setItem('errorBoundaryLog', JSON.stringify(errorLog));
      }
    } catch (loggingError) {
      // Fallback 3: Silent fail - never break the error boundary with logging errors
      console.warn('Failed to log error to storage:', loggingError); // eslint-disable-line no-console
    }
  }

  /**
   * Reset the error boundary state
   * Clears error and allows the app to recover
   */
  resetError = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  /**
   * Auto-reset after a delay (optional)
   */
  resetErrorAfterDelay = (delayMs: number = 5000): void => {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }
    this.resetTimeoutId = setTimeout(() => {
      this.resetError();
    }, delayMs);
  };

  componentWillUnmount(): void {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }
  }

  /**
   * Monitor resetKeys prop and reset on change
   */
  componentDidUpdate(prevProps: ErrorBoundaryProps): void {
    if (this.state.hasError && this.props.resetKeys) {
      const hasResetKeyChanged =
        !prevProps.resetKeys ||
        this.props.resetKeys.some(
          (key, index) => key !== prevProps.resetKeys?.[index]
        );

      if (hasResetKeyChanged) {
        this.resetError();
      }
    }
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      // Custom fallback provided by consumer
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      const isDev = process.env.NODE_ENV === 'development';

      return (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            padding: '2rem',
            backgroundColor: '#f8f9fa',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          }}
        >
          <div style={{ maxWidth: '600px', textAlign: 'center' }}>
            <h1 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#333' }}>
              Something went wrong
            </h1>
            <p style={{ fontSize: '1rem', marginBottom: '2rem', color: '#666' }}>
              The application encountered an unexpected error. Please try refreshing the page or
              contact support if the problem persists.
            </p>

            {isDev && this.state.error && (
              <details
                style={{
                  marginBottom: '2rem',
                  padding: '1rem',
                  backgroundColor: '#fff',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  textAlign: 'left',
                }}
              >
                <summary style={{ cursor: 'pointer', fontWeight: 'bold', marginBottom: '1rem' }}>
                  Error Details (Dev Only)
                </summary>
                <pre
                  style={{
                    fontSize: '0.875rem',
                    overflow: 'auto',
                    backgroundColor: '#f5f5f5',
                    padding: '1rem',
                    borderRadius: '4px',
                  }}
                >
                  {this.state.error.toString()}
                  {'\n\n'}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}

            <button
              onClick={this.resetError}
              style={{
                padding: '0.75rem 1.5rem',
                fontSize: '1rem',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
              onMouseOver={(e) => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#0056b3';
              }}
              onMouseOut={(e) => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#007bff';
              }}
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
