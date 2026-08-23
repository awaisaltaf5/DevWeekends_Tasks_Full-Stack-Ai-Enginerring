function SkeletonLoader() {
  return (
    <div className="animate-pulse space-y-6">
      {/* Main card skeleton */}
      <div className="glass-strong rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="flex justify-between">
          <div className="w-10 h-10 rounded-full bg-white/10" />
          <div className="w-32 h-6 rounded-lg bg-white/10" />
          <div className="w-10 h-10 rounded-full bg-white/10" />
        </div>
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-white/10" />
          <div className="space-y-2">
            <div className="w-32 h-8 rounded-lg bg-white/10" />
            <div className="w-24 h-4 rounded-lg bg-white/10" />
          </div>
        </div>
        <div className="w-40 h-16 rounded-lg bg-white/10" />
      </div>

      {/* Details grid skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="glass rounded-xl p-4 space-y-3">
            <div className="w-10 h-10 rounded-lg bg-white/10" />
            <div className="w-16 h-4 rounded-lg bg-white/10" />
            <div className="w-24 h-6 rounded-lg bg-white/10" />
          </div>
        ))}
      </div>

      {/* Hourly skeleton */}
      <div className="glass rounded-2xl p-4 sm:p-6">
        <div className="w-32 h-4 rounded-lg bg-white/10 mb-4" />
        <div className="flex gap-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="min-w-[60px] p-3 rounded-xl space-y-2">
              <div className="w-10 h-3 rounded bg-white/10" />
              <div className="w-8 h-8 rounded-full bg-white/10 mx-auto" />
              <div className="w-8 h-4 rounded bg-white/10" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default SkeletonLoader;