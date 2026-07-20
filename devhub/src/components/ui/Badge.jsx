const variants = {
  language: {
    JavaScript: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    TypeScript: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    Python: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    Go: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300',
    Rust: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
    Java: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    default: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
  },
  tag: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  status: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
}

function Badge({ children, variant = 'default', language = null, className = '' }) {
  let classes = variants.default || variants.language.default

  if (variant === 'language' && language) {
    classes = variants.language[language] || variants.language.default
  } else if (variant === 'tag') {
    classes = variants.tag
  } else if (variant === 'status') {
    classes = variants.status
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${classes} ${className}`}>
      {children}
    </span>
  )
}

export default Badge