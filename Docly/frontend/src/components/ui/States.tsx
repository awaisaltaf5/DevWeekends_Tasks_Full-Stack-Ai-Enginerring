import type { ReactNode } from 'react';
import { Loader2, AlertCircle, SearchX, RefreshCw } from 'lucide-react';
import logoMark from '../../assets/logo-mark.svg';

/** Centered spinner used for initial data loads. */
export function LoadingState({ label = 'Loading...' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <div className="relative flex h-12 w-12 items-center justify-center">
        <img src={logoMark} alt="Docly" className="h-10 w-10" />
        <Loader2 className="absolute inset-0 h-12 w-12 animate-spin text-primary/50" />
      </div>
      <p className="text-sm text-muted">{label}</p>
    </div>
  );
}

/** Skeletons shown while a grid of doctors is loading. */
export function DoctorGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div
      className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
      role="status"
      aria-label="Loading doctors"
    >
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card animate-pulse p-5">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-full bg-background-alt" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-3/4 rounded bg-background-alt" />
              <div className="h-3 w-1/2 rounded bg-background-alt" />
            </div>
          </div>
          <div className="mt-4 h-3 w-full rounded bg-background-alt" />
          <div className="mt-2 h-3 w-2/3 rounded bg-background-alt" />
          <div className="mt-4 flex gap-2">
            <div className="h-8 w-20 rounded-lg bg-background-alt" />
            <div className="h-8 w-20 rounded-lg bg-background-alt" />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Error banner with a retry action. */
export function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
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
}

/** Empty state shown when no results match the current filters. */
export function EmptyState({
  title = 'No doctors found',
  description = 'Try adjusting your filters or search terms.',
  children,
}: {
  title?: string;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
      <SearchX className="h-10 w-10 text-muted" />
      <h3 className="font-semibold text-foreground">{title}</h3>
      <p className="max-w-sm text-sm text-muted">{description}</p>
      {children}
    </div>
  );
}