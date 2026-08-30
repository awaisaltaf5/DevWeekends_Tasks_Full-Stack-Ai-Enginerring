import { Star, StarHalf } from 'lucide-react';

interface Props {
  rating: number;
  reviews?: number;
  size?: number;
  showValue?: boolean;
}

/** Renders a 5-star rating (supports half stars) with optional review count. */
export function RatingStars({ rating, reviews, size = 15, showValue = true }: Props) {
  const clamped = Math.max(0, Math.min(5, rating));

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center" aria-label={`Rated ${clamped} out of 5`}>
        {[1, 2, 3, 4, 5].map((star) => {
          const filled = clamped >= star;
          const half = !filled && clamped > star - 1;
          if (half) {
            return <StarHalf key={star} style={{ width: size, height: size }} className="fill-amber-400 text-amber-400" />;
          }
          return (
            <Star
              key={star}
              style={{ width: size, height: size }}
              className={filled ? 'fill-amber-400 text-amber-400' : 'text-border'}
            />
          );
        })}
      </div>
      {showValue && (
        <span className="text-sm font-medium text-foreground">{clamped.toFixed(1)}</span>
      )}
      {reviews !== undefined && (
        <span className="text-xs text-muted">({reviews})</span>
      )}
    </div>
  );
}