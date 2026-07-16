import { ChefHat } from 'lucide-react'

export default function LoadingSpinner({ size = 40, className = '' }) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="relative">
        <div className="absolute inset-0 rounded-full border-4 border-primary/20 dark:border-dark-primary/20 animate-ping" />
        <div className="relative animate-spin-slow">
          <ChefHat 
            size={size} 
            className="text-primary dark:text-dark-primary"
            strokeWidth={1.5}
          />
        </div>
      </div>
    </div>
  )
}