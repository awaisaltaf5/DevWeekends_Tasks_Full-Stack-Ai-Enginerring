import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  message: string;
}

export default class RouteErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: '' };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[Docly] Route render error:', error, info.componentStack);
  }

  handleRetry = () => {
    this.setState({ hasError: false, message: '' });
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <section className="container-docly flex min-h-[50vh] items-center justify-center py-12">
        <div className="flex max-w-lg flex-col items-center gap-4 rounded-2xl border border-red-200 bg-red-50 px-6 py-10 text-center">
          <AlertTriangle className="h-10 w-10 text-red-500" />
          <h1 className="text-xl font-semibold text-foreground">This page could not load</h1>
          <p className="text-sm text-muted">
            Something unexpected happened while rendering this page. Please try again.
          </p>
          {import.meta.env.DEV && this.state.message && (
            <p className="max-w-md break-words text-xs text-red-700">{this.state.message}</p>
          )}
          <button type="button" onClick={this.handleRetry} className="btn-secondary px-4 py-2 text-sm">
            <RefreshCw className="h-4 w-4" />
            Try again
          </button>
        </div>
      </section>
    );
  }
}
