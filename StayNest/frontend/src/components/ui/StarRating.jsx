import { Star as StarIcon } from 'lucide-react'

/**
 * Read-only star rating display (1-5). `size` controls icon size, `showValue`
 * optionally renders the numeric value alongside the stars.
 */
export default function StarRating({ rating = 0, size = 16, showValue = false, className = '' }) {
  const safe = Math.max(0, Math.min(5, Number(rating) || 0))
  const filled = Math.round(safe)
  const stars = Array.from({ length: 5 }, (_, i) => {
    const filledStar = i < filled
    return (
      <StarIcon
        key={i}
        size={size}
        className={filledStar ? 'fill-amber-400 text-amber-400' : 'text-border'}
      />
    )
  })
  return (
    <span className={`inline-flex items-center gap-0.5 ${className}`}>
      {stars}
      {showValue && <span className="ml-1 text-sm text-muted">{Number.isFinite(safe) ? safe.toFixed(1) : '0.0'}</span>}
    </span>
  )
}
