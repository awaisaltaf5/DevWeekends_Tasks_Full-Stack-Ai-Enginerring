import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

export default function Modal({ isOpen, onClose, title, children }) {
  // Close on Escape key
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

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />
          
          {/* Modal Container - centered with safe margins */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', duration: 0.3 }}
              className="w-full max-w-sm pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-card dark:bg-dark-card rounded-3xl border border-border dark:border-dark-border shadow-2xl overflow-hidden max-h-[85vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-border dark:border-dark-border shrink-0">
                  <h3 className="text-lg font-bold text-text-primary dark:text-dark-text-primary">
                    {title}
                  </h3>
                  <button
                    onClick={onClose}
                    className="w-8 h-8 rounded-full hover:bg-border dark:hover:bg-dark-border flex items-center justify-center transition-colors"
                  >
                    <X size={18} className="text-text-secondary dark:text-dark-text-secondary" />
                  </button>
                </div>
                
                {/* Content - scrollable if needed */}
                <div className="p-5 overflow-y-auto">
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