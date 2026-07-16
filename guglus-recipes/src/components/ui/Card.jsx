export default function Card({ children, className = '', onClick }) {
  const isInteractive = typeof onClick === 'function'

  return (
    <div
      className={`bg-card dark:bg-dark-card rounded-3xl border border-border dark:border-dark-border overflow-hidden transition-all duration-200 ease-out shadow-sm hover:shadow-lg dark:hover:shadow-black/30 ${
        isInteractive
          ? 'cursor-pointer hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] hover:border-primary/30 dark:hover:border-dark-primary/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 dark:focus-visible:ring-dark-primary/50'
          : ''
      } ${className}`}
      onClick={onClick}
      role={isInteractive ? 'button' : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      onKeyDown={
        isInteractive
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onClick(e)
              }
            }
          : undefined
      }
    >
      {children}
    </div>
  )
}