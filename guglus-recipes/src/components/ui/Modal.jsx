import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

export default function Modal({ isOpen, onClose, title, children }) {
  const panelRef = useRef(null)
  const closeButtonRef = useRef(null)
  const previouslyFocusedRef = useRef(null)

  // Close on Escape key + body scroll lock
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose()
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  // Focus management: move focus into the modal on open, restore it on close.
  // The original had no focus handling at all, so keyboard/screen-reader
  // users lost their place whenever a modal opened.
  useEffect(() => {
    if (isOpen) {
      previouslyFocusedRef.current = document.activeElement
      closeButtonRef.current?.focus()
    } else if (previouslyFocusedRef.current) {
      previouslyFocusedRef.current.focus()
    }
  }, [isOpen])

  // Simple focus trap - Tab/Shift+Tab cycles within the modal instead of
  // escaping to page content behind it
  const handleKeyDown = (e) => {
    if (e.key !== 'Tab' || !panelRef.current) return
    const focusable = panelRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    if (focusable.length === 0) return
    const first = focusable[0]
    const last = focusable[focusable.length - 1]

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault()
      last.focus()
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault()
      first.focus()
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          {/* FIX: removed backdrop-blur-sm. A blurred fixed overlay sitting next
              to a spring-transform-animated fixed panel is the Android Chrome
              GPU compositor bug that causes "scattered/garbled" repaints,
              especially visible in dark mode. Solid darker overlay looks
              nearly identical and paints cheaper (faster open animation). */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 z-50"
          />
          
          {/* Modal Container - centered with safe margins */}
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
            style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', duration: 0.3 }}
              style={{ contain: 'content' }}
              className="w-full max-w-sm pointer-events-auto transform-gpu will-change-transform isolate"
              onClick={(e) => e.stopPropagation()}
              onKeyDown={handleKeyDown}
              role="dialog"
              aria-modal="true"
              aria-labelledby="modal-title"
            >
              <div
                ref={panelRef}
                className="bg-card dark:bg-dark-card rounded-2xl sm:rounded-3xl border border-border dark:border-dark-border shadow-2xl overflow-hidden max-h-[85vh] flex flex-col"
              >
                {/* Header */}
                <div className="flex items-center justify-between gap-3 p-4 sm:p-5 border-b border-border dark:border-dark-border shrink-0">
                  <h3 id="modal-title" className="text-base sm:text-lg font-bold text-text-primary dark:text-dark-text-primary truncate">
                    {title}
                  </h3>
                  <button
                    ref={closeButtonRef}
                    onClick={onClose}
                    aria-label="Close dialog"
                    className="w-8 h-8 rounded-full hover:bg-border dark:hover:bg-dark-border active:scale-90 flex items-center justify-center transition-all shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 dark:focus-visible:ring-dark-primary/60"
                  >
                    <X size={18} className="text-text-secondary dark:text-dark-text-secondary" />
                  </button>
                </div>
                
                {/* Content - scrollable if needed */}
                <div className="p-4 sm:p-5 overflow-y-auto">
                  {children}
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}