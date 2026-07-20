function Card({ children, className = '', onClick, hoverable = false }) {
  return (
    <div
      onClick={onClick}
      className={`
        bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700
        shadow-sm transition-all duration-200
        ${hoverable ? 'hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600 cursor-pointer' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  )
}

export default Card