function Skeleton({ className = '', count = 1 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg ${className}`}
        >
          <div className="skeleton-shimmer h-full w-full rounded-lg" />
        </div>
      ))}
    </>
  )
}

export default Skeleton