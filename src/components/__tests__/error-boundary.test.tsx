/**
 * @jest-environment jsdom
 */
import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorBoundary } from '../ErrorBoundary';

/**
 * Mock component that throws an error
 */
function ThrowError(): React.ReactElement {
  throw new Error('Test error message');
}

/**
 * Mock component that renders successfully
 */
function WorkingComponent(): React.ReactElement {
  return <div>Working component</div>;
}

// Suppress error logs for cleaner test output
const originalError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalError;
});

describe('ErrorBoundary', () => {
  describe('Rendering without errors', () => {
    it('should render children when no error occurs', () => {
      render(
        <ErrorBoundary>
          <WorkingComponent />
        </ErrorBoundary>
      );

      expect(screen.getByText('Working component')).toBeInTheDocument();
    });

    it('should render multiple children without errors', () => {
      render(
        <ErrorBoundary>
          <div>Child 1</div>
          <div>Child 2</div>
        </ErrorBoundary>
      );

      expect(screen.getByText('Child 1')).toBeInTheDocument();
      expect(screen.getByText('Child 2')).toBeInTheDocument();
    });
  });

  describe('Error catching and fallback UI', () => {
    it('should catch errors and display default fallback UI', () => {
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
      expect(
        screen.getByText(
          /The application encountered an unexpected error/
        )
      ).toBeInTheDocument();
    });

    it('should display custom fallback when provided', () => {
      const customFallback = <div>Custom Error UI</div>;

      render(
        <ErrorBoundary fallback={customFallback}>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(screen.getByText('Custom Error UI')).toBeInTheDocument();
      expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument();
    });
  });

  describe('Error recovery', () => {
    it('should reset error state when "Try Again" button is clicked', () => {
      const { rerender } = render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();

      // After reset, we need to rerender with working component
      rerender(
        <ErrorBoundary>
          <WorkingComponent />
        </ErrorBoundary>
      );

      const tryAgainButton = screen.getByText('Try Again');
      fireEvent.click(tryAgainButton);

      expect(screen.getByText('Working component')).toBeInTheDocument();
    });

    it('should reset error when resetKeys prop changes', () => {
      const { rerender } = render(
        <ErrorBoundary resetKeys={['key1']}>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();

      // Change resetKeys to trigger reset
      rerender(
        <ErrorBoundary resetKeys={['key2']}>
          <WorkingComponent />
        </ErrorBoundary>
      );

      expect(screen.getByText('Working component')).toBeInTheDocument();
    });
  });

  describe('Error logging', () => {
    it('should call onError callback when error is caught', () => {
      const onError = jest.fn();

      render(
        <ErrorBoundary onError={onError}>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(onError).toHaveBeenCalled();
      expect(onError).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({
          componentStack: expect.any(String),
        })
      );
    });
  });

  describe('Nested Error Boundaries', () => {
    it('should catch errors at multiple nesting levels', () => {
      render(
        <ErrorBoundary>
          <div>Outer content</div>
          <ErrorBoundary>
            <ThrowError />
          </ErrorBoundary>
        </ErrorBoundary>
      );

      expect(screen.getByText('Outer content')).toBeInTheDocument();
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });

    it('should show contextual fallback UI at nested level', () => {
      render(
        <ErrorBoundary>
          <div>Outer content</div>
          <ErrorBoundary fallback={<div>Inner error fallback</div>}>
            <ThrowError />
          </ErrorBoundary>
        </ErrorBoundary>
      );

      expect(screen.getByText('Outer content')).toBeInTheDocument();
      expect(screen.getByText('Inner error fallback')).toBeInTheDocument();
      expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument();
    });
  });
});
