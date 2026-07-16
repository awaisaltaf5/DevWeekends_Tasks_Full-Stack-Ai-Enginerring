export default function Card({ children, className = '', onClick }) {
  return (
    <div 
      className={`bg-card dark:bg-dark-card rounded-3xl border border-border dark:border-dark-border overflow-hidden transition-all duration-200 hover:shadow-lg ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  )
}