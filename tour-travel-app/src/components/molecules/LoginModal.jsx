import { X, Sparkles } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import Button from '../atoms/Button'

export default function LoginModal() {
  const { showLoginModal, closeModal } = useAuth()

  if (!showLoginModal) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={closeModal}
      />
      
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-8 animate-slide-up">
        <button
          onClick={closeModal}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-primary-bg dark:bg-primary/20 rounded-full flex items-center justify-center mb-4">
            <Sparkles className="w-8 h-8 text-primary dark:text-primary-light" />
          </div>
          
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Coming Soon!
          </h3>
          
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Login and registration features will be available in the next update. Stay tuned for exciting features!
          </p>
          
          <Button onClick={closeModal} variant="primary" className="w-full">
            Got it
          </Button>
        </div>
      </div>
    </div>
  )
}