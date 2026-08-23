function Card({ children, className = '', onClick, hoverable = false }) {
  return (
    <div
      onClick={onClick}
      className={`
        bg-white dark:bg-gray-800/90 rounded-xl border border-gray-200/80 dark:border-gray-700/80
        shadow-sm transition-all duration-300
        ${hoverable ? 'hover:shadow-lg hover:border-gray-300 dark:hover:border-gray-600 hover:-translate-y-0.5 cursor-pointer' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  )
}

export default Card