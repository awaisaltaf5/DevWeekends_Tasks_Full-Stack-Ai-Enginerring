function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      {/* Image placeholder */}
      <div className="aspect-[16/10] w-full animate-pulse bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200" />

      <div className="space-y-3 p-5">
        {/* Hotel name & rating row */}
        <div className="flex items-center justify-between gap-3">
          <div className="h-5 w-2/3 animate-pulse rounded-md bg-slate-200" />
          <div className="h-6 w-12 animate-pulse rounded-md bg-slate-200" />
        </div>
        {/* Location */}
        <div className="h-4 w-1/2 animate-pulse rounded bg-slate-200" />
        {/* Description lines */}
        <div className="h-3 w-full animate-pulse rounded bg-slate-200" />
        <div className="h-3 w-4/5 animate-pulse rounded bg-slate-200" />
        {/* Amenity chips */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          <div className="h-5 w-16 animate-pulse rounded-md bg-slate-200" />
          <div className="h-5 w-14 animate-pulse rounded-md bg-slate-200" />
          <div className="h-5 w-20 animate-pulse rounded-md bg-slate-200" />
        </div>
        {/* Price + CTA row */}
        <div className="flex items-center justify-between border-t border-border pt-3">
          <div>
            <div className="h-3 w-20 animate-pulse rounded bg-slate-200" />
            <div className="mt-1 h-6 w-28 animate-pulse rounded-md bg-slate-200" />
          </div>
          <div className="h-9 w-28 animate-pulse rounded-xl bg-slate-200" />
        </div>
      </div>
    </div>
  )
}

export default function HotelSkeleton({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}
