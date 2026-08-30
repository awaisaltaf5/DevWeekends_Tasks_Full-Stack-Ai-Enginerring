import React, { createContext, useCallback, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: number;
  type: ToastType;
  message: string;
}

interface ToastContextValue {
  /** Push a toast notification onto the screen. */
  toast: (type: ToastType, message: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

let nextId = 1;
const AUTO_DISMISS = 4200;

const TOAST_STYLES: Record<ToastType, { container: string; icon: ReactNode }> = {
  success: { container: 'border-emerald-200 bg-white', icon: <CheckCircle2 className="h-5 w-5 text-emerald-600" /> },
  error: { container: 'border-red-200 bg-white', icon: <AlertCircle className="h-5 w-5 text-red-600" /> },
  info: { container: 'border-primary-light bg-white', icon: <Info className="h-5 w-5 text-primary" /> },
  warning: { container: 'border-amber-200 bg-white', icon: <AlertCircle className="h-5 w-5 text-amber-600" /> },
};

function ToastItem({ toastData, onDismiss }: { toastData: Toast; onDismiss: () => void }) {
  const styles = TOAST_STYLES[toastData.type];
  return (
    <div
      role="status"
      className={`animate-slide-in-right flex items-start gap-3 rounded-xl border px-4 py-3 shadow-lg ${styles.container}`}
    >
      <div className="mt-0.5 flex-shrink-0">{styles.icon}</div>
      <p className="text-sm font-medium text-foreground">{toastData.message}</p>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss notification"
        className="ml-auto text-muted hover:text-foreground"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

/** Provides lightweight toast notifications for success/error/info feedback. */
export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback((type: ToastType, message: string) => {
    const id = nextId++;
    setToasts((prev) => [...prev, { id, type, message }]);
    window.setTimeout(() => dismiss(id), AUTO_DISMISS);
  }, [dismiss]);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-3 sm:bottom-5 sm:right-5">
        {toasts.map((t) => (
          <ToastItem key={t.id} toastData={t} onDismiss={() => dismiss(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextValue => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};