import { createContext, useContext, useState, useCallback, useRef } from 'react'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'

// ============================================
// STEP 1: Create the Context
// ============================================
const NotificationContext = createContext({
  toasts: [],
  showToast: () => {},
  removeToast: () => {},
})

// Toast type configurations
const toastConfig = {
  success: {
    icon: CheckCircle,
    bg: 'bg-green-500',
    darkBg: 'dark:bg-green-600',
  },
  error: {
    icon: AlertCircle,
    bg: 'bg-red-500',
    darkBg: 'dark:bg-red-600',
  },
  warning: {
    icon: AlertTriangle,
    bg: 'bg-yellow-500',
    darkBg: 'dark:bg-yellow-600',
  },
  info: {
    icon: Info,
    bg: 'bg-blue-500',
    darkBg: 'dark:bg-blue-600',
  },
}

// ============================================
// STEP 2: Create the Provider
// ============================================
export function NotificationProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const toastIdRef = useRef(0)

  // useCallback prevents unnecessary re-renders of consumers
  const showToast = useCallback((message, type = 'info', duration = 3000) => {
    const id = ++toastIdRef.current
    
    const newToast = {
      id,
      message,
      type,
      createdAt: Date.now(),
    }

    setToasts((prev) => [...prev, newToast])

    // Auto-dismiss after duration
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, duration)
    }

    return id // Return ID so caller can manually dismiss
  }, [])

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const value = {
    toasts,
    showToast,
    removeToast,
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
      
      {/* Toast Container — rendered once at app root */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </NotificationContext.Provider>
  )
}

// ============================================
// Toast Container Component
// ============================================
function ToastContainer({ toasts, onRemove }) {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 w-full max-w-sm pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  )
}

// ============================================
// Individual Toast Component
// ============================================
function ToastItem({ toast, onRemove }) {
  const config = toastConfig[toast.type] || toastConfig.info
  const Icon = config.icon

  return (
    <div
      className={`
        pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-lg shadow-lg
        text-white transform transition-all duration-300 animate-slide-up
        ${config.bg} ${config.darkBg}
      `}
      role="alert"
    >
      <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
      <p className="flex-1 text-sm font-medium">{toast.message}</p>
      <button
        onClick={() => onRemove(toast.id)}
        className="flex-shrink-0 p-0.5 rounded hover:bg-white/20 transition-colors"
        aria-label="Dismiss notification"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}

// ============================================
// STEP 3: Custom Hook
// ============================================
export function useNotification() {
  const context = useContext(NotificationContext)
  
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider')
  }
  
  return context
}