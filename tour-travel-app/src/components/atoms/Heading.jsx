export default function Heading({ level = 1, children, className = '' }) {
  const Tag = `h${level}`
  
  const sizes = {
    1: 'text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight',
    2: 'text-3xl md:text-4xl font-bold leading-tight tracking-tight',
    3: 'text-2xl md:text-3xl font-semibold leading-snug',
    4: 'text-xl font-semibold leading-snug',
    5: 'text-lg font-semibold leading-snug',
    6: 'text-base font-semibold leading-snug',
  }
  
  return (
    <Tag className={`text-gray-900 dark:text-white ${sizes[level]} ${className}`}>
      {children}
    </Tag>
  )
}