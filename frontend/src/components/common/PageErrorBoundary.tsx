/**
 * PageErrorBoundary Component
 * Smaller error boundary for page-level errors (keeps layout intact)
 * 
 * @module components/common/PageErrorBoundary
 */

import { Component, type ReactNode, type ErrorInfo } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface PageErrorBoundaryProps {
  children: ReactNode;
  pageName?: string;
}

interface PageErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export default class PageErrorBoundary extends Component<PageErrorBoundaryProps, PageErrorBoundaryState> {
  constructor(props: PageErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<PageErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error(`PageErrorBoundary [${this.props.pageName ?? 'Unknown'}]:`, error);
    console.error('Component stack:', errorInfo.componentStack);
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    const { hasError, error } = this.state;
    const { children, pageName } = this.props;

    if (hasError) {
      return (
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-7 h-7 text-red-600" />
          </div>
          
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            {pageName ? `Error loading ${pageName}` : 'Something went wrong'}
          </h2>
          
          <p className="text-gray-600 text-center max-w-sm mb-4">
            There was a problem loading this section. Please try again.
          </p>

          {process.env.NODE_ENV === 'development' && error && (
            <p className="text-sm text-red-500 font-mono mb-4 max-w-md text-center">
              {error.message}
            </p>
          )}
          
          <button
            onClick={this.handleRetry}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
        </div>
      );
    }

    return children;
  }
}