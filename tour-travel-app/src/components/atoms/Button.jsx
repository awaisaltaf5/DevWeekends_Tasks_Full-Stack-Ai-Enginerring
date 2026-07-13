import { forwardRef } from 'react'

const Button = forwardRef(function Button(
  { children, variant = 'primary', size = 'medium', className = '', ...props },
  ref
) {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'
  
  const variants = {
    primary: 'bg-primary text-white hover:bg-primary-dark focus:ring-primary/50 dark:bg-primary-light dark:hover:bg-primary',
    secondary: 'bg-secondary text-white hover:bg-secondary-dark focus:ring-secondary/50',
    outline: 'border-2 border-primary text-primary hover:bg-primary-bg focus:ring-primary/50 dark:border-primary-light dark:text-primary-light dark:hover:bg-primary/10',
    ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500/50 dark:text-gray-200 dark:hover:bg-gray-800',
    dark: 'bg-gray-900 text-white hover:bg-gray-800 focus:ring-gray-900/50 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200',
  }
  
  const sizes = {
    small: 'px-4 py-2 text-sm gap-2',
    medium: 'px-6 py-3 text-base gap-2',
    large: 'px-8 py-4 text-lg gap-3',
  }
  
  return (
    <button
      ref={ref}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
})

export default Button