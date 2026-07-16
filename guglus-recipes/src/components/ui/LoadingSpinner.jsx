import { ChefHat } from 'lucide-react'

export default function LoadingSpinner({ size = 40, className = '' }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex items-center justify-center ${className}`}
    >
      <div className="relative">
        <div className="absolute inset-0 rounded-full border-4 border-primary/20 dark:border-dark-primary/20 animate-ping motion-reduce:animate-none" />
        <div className="relative animate-spin-slow motion-reduce:animate-none">
          <ChefHat 
            size={size} 
            className="text-primary dark:text-dark-primary transition-colors duration-300"
            strokeWidth={1.5}
          />
        </div>
      </div>
      {/* Visually hidden but announced to screen readers - the animation alone
          conveys nothing to assistive tech */}
      <span className="sr-only">Loading...</span>
    </div>
  )
}