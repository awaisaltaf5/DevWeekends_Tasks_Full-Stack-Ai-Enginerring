import React from 'react';
import { AlertCircle, Loader2, RefreshCw, SearchX } from 'lucide-react';
import BrandLogo from './BrandLogo';

/** Centered Docly-branded loading state. */
export const LoadingState: React.FC<{ label?: string }> = ({ label = 'Loading…' }) => (
  <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
    <div className="relative flex h-12 w-12 items-center justify-center">
      <BrandLogo markOnly className="h-10 w-10" />
      <Loader2 className="absolute inset-0 h-12 w-12 animate-spin text-primary/50" />
    </div>
    <p className="text-sm text-muted">{label}</p>
  </div>
);

/** Error banner with an optional retry action. */
export const ErrorState: React.FC<{ message: string; onRetry?: () => void }> = ({ message, onRetry }) => (
  <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-6 py-12 text-center">
    <AlertCircle className="h-9 w-9 text-red-500" />
    <h3 className="font-semibold text-foreground">Something went wrong</h3>
    <p className="max-w-md text-sm text-muted">{message}</p>
    {onRetry && (
      <button type="button" onClick={onRetry} className="btn-secondary mt-2 px-4 py-2 text-sm">
        <RefreshCw className="h-4 w-4" />
        Try again
      </button>
    )}
  </div>
);

/** Empty state shown when no records match the current filters. */
export const EmptyState: React.FC<{
  title?: string;
  description?: string;
  children?: React.ReactNode;
}> = ({ title = 'No records found', description = 'Try adjusting your filters or search terms.', children }) => (
  <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
    <SearchX className="h-10 w-10 text-muted" />
    <h3 className="font-semibold text-foreground">{title}</h3>
    <p className="max-w-sm text-sm text-muted">{description}</p>
    {children}
  </div>
);