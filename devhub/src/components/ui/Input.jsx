import { Search } from 'lucide-react'

function Input({
  type = 'text',
  placeholder = '',
  value,
  onChange,
  icon: Icon = null,
  className = '',
  ...props
}) {
  return (
    <div className="relative">
      {Icon && (
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Icon className="w-5 h-5 text-gray-400" />
        </div>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`
          w-full rounded-lg border border-gray-300 dark:border-gray-600
          bg-white dark:bg-gray-800 text-gray-900 dark:text-white
          placeholder-gray-400 dark:placeholder-gray-500
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
          transition-all duration-200
          ${Icon ? 'pl-10' : 'pl-4'} pr-4 py-2.5
          ${className}
        `}
        {...props}
      />
    </div>
  )
}

export default Input