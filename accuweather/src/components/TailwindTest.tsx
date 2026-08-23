function TailwindTest() {
  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center p-4">
      <div className="glass rounded-2xl p-8 max-w-md w-full space-y-6 animate-fade-in">
        
        {/* Title */}
        <h1 className="text-3xl font-bold text-white text-center">
          Tailwind Test
        </h1>
        
        {/* Custom Colors Test */}
        <div className="space-y-3">
          <p className="text-slate-400 text-sm uppercase tracking-wider font-semibold">
            Custom Colors
          </p>
          <div className="flex gap-3">
            <div className="w-16 h-16 rounded-lg bg-dark-bg border border-white/10 flex items-center justify-center">
              <span className="text-xs text-slate-400">bg</span>
            </div>
            <div className="w-16 h-16 rounded-lg bg-dark-card border border-white/10 flex items-center justify-center">
              <span className="text-xs text-slate-400">card</span>
            </div>
            <div className="w-16 h-16 rounded-lg bg-accent border border-white/10 flex items-center justify-center">
              <span className="text-xs text-black font-bold">accent</span>
            </div>
            <div className="w-16 h-16 rounded-lg bg-accent-hover border border-white/10 flex items-center justify-center">
              <span className="text-xs text-black font-bold">hover</span>
            </div>
          </div>
        </div>

        {/* Typography Test */}
        <div className="space-y-3">
          <p className="text-slate-400 text-sm uppercase tracking-wider font-semibold">
            Typography
          </p>
          <div className="space-y-2">
            <p className="text-4xl font-extrabold text-white">24°C</p>
            <p className="text-xl font-semibold text-accent">Sunny</p>
            <p className="text-base text-slate-300">London, UK</p>
            <p className="text-sm text-slate-400">Humidity: 65%</p>
          </div>
        </div>

        {/* Glass Effect Test */}
        <div className="space-y-3">
          <p className="text-slate-400 text-sm uppercase tracking-wider font-semibold">
            Glass Effect
          </p>
          <div className="glass-strong rounded-xl p-4">
            <p className="text-white">This card uses glass-strong utility</p>
          </div>
        </div>

        {/* Animation Test */}
        <div className="space-y-3">
          <p className="text-slate-400 text-sm uppercase tracking-wider font-semibold">
            Animations
          </p>
          <div className="animate-slide-up">
            <div className="bg-accent text-black font-bold py-2 px-4 rounded-lg text-center">
              This slides up on load
            </div>
          </div>
        </div>

        {/* Responsive Test */}
        <div className="space-y-3">
          <p className="text-slate-400 text-sm uppercase tracking-wider font-semibold">
            Responsive (resize window)
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-sky-500 text-white p-3 rounded-lg text-center">
              <span className="sm:hidden">Mobile (1 col)</span>
              <span className="hidden sm:block">Desktop (2 cols)</span>
            </div>
            <div className="bg-sky-600 text-white p-3 rounded-lg text-center hidden sm:block">
              Only on sm+
            </div>
          </div>
        </div>

        {/* Button Test */}
        <button className="w-full bg-accent hover:bg-accent-hover text-black font-bold py-3 px-6 rounded-full transition-all duration-200 hover:scale-[1.02] active:scale-95">
          Test Button
        </button>

      </div>
    </div>
  );
}

export default TailwindTest;