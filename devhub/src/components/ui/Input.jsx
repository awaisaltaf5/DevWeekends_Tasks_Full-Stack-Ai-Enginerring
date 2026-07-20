import { forwardRef } from 'react'

const Input = forwardRef(function Input({
  type = 'text',
  placeholder = '',
  value,
  onChange,
  icon: Icon = null,
  className = '',
  ...props
}, ref) {
  return (
    <div className="relative group">
      {Icon && (
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
          <Icon className="w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-200" />
        </div>
      )}
      <input
        ref={ref}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`
          w-full rounded-xl border border-gray-300 dark:border-gray-600
          bg-white dark:bg-gray-800/90 text-gray-900 dark:text-white
          placeholder-gray-400 dark:placeholder-gray-500
          focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500
          transition-all duration-200
          ${Icon ? 'pl-11' : 'pl-4'} pr-4 py-2.5
          text-sm
          ${className}
        `}
        {...props}
      />
    </div>
  )
})

export default Input