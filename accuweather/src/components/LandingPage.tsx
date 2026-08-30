import { useEffect, useRef } from 'react';
import { CloudRain, ArrowRight, Sun, Cloud, Sparkles, Clock3, Globe2 } from 'lucide-react';

function LandingPage({ onGetStarted }) {
  const buttonRef = useRef(null);

  useEffect(() => {
    buttonRef.current?.focus();
  }, []);

  return (
    <div className="min-h-screen bg-dark-bg flex flex-col items-center justify-center relative overflow-hidden animate-fade-in">

      {/* Layered aurora background */}
      <div className="absolute inset-0 bg-gradient-to-b from-dark-bg via-[#0a1024] to-dark-card" />
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[42rem] h-[42rem] rounded-full bg-violet-600/15 blur-3xl animate-drift" />
      <div className="absolute top-1/4 -left-24 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl animate-pulse-slow" />
      <div className="absolute -bottom-24 -right-16 w-[30rem] h-[30rem] bg-accent/[0.07] rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1.6s' }} />

      {/* Subtle dot grid */}
      <div
        className="absolute inset-0 opacity-35 [mask-image:radial-gradient(ellipse_60%_55%_at_50%_45%,black,transparent)]"
        style={{
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.14) 1px, transparent 1px)',
          backgroundSize: '26px 26px',
        }}
      />

      {/* Floating decorative weather glyphs */}
      <Sun className="absolute top-[18%] left-[12%] w-8 h-8 text-accent/40 hidden md:block animate-float" />
      <Cloud className="absolute top-[28%] right-[14%] w-9 h-9 text-sky-300/30 hidden md:block animate-float" style={{ animationDelay: '1.4s' }} />
      <CloudRain className="absolute bottom-[22%] left-[18%] w-7 h-7 text-violet-300/25 hidden md:block animate-float" style={{ animationDelay: '2.6s' }} />

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-4 py-16">

        {/* Weather Icon emblem */}
        <div className="mb-8 relative group animate-slide-up">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-[1.75rem] glass-strong shadow-card flex items-center justify-center transition-transform duration-500 group-hover:scale-105 group-hover:-rotate-3">
            <CloudRain className="w-11 h-11 text-accent drop-shadow-[0_0_12px_rgba(251,191,36,0.45)]" />
          </div>
          <div className="absolute inset-0 w-full h-full rounded-[1.75rem] bg-accent/20 blur-2xl -z-10 animate-pulse-slow" />
          {/* Orbiting spark */}
          <Sparkles className="absolute -top-2 -right-2 w-5 h-5 text-accent animate-spin-slow" />
        </div>

        {/* Eyebrow badge */}
        <div className="mb-6 animate-slide-up" style={{ animationDelay: '80ms' }}>
          <span className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 text-xs font-medium tracking-wide text-slate-300">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
            </span>
            Live forecasts · Updated every moment
          </span>
        </div>

        {/* Title */}
        <h1 className="font-display text-5xl sm:text-7xl lg:text-8xl font-extrabold text-white mb-5 tracking-tight leading-tight animate-slide-up" style={{ animationDelay: '160ms' }}>
          Accu<span className="text-gradient-accent">Weather</span>
        </h1>

        {/* Tagline */}
        <p className="text-lg sm:text-xl text-slate-400 mb-10 max-w-md leading-relaxed animate-slide-up" style={{ animationDelay: '240ms' }}>
          Real-time forecasts, anywhere. Plan every hour with confidence — beautiful, precise, and always in your pocket.
        </p>

        {/* Get Started Button */}
        <button
          ref={buttonRef}
          onClick={onGetStarted}
          className="group relative overflow-hidden bg-gradient-to-b from-amber-300 to-accent hover:from-amber-200 hover:to-accent-hover text-slate-900 font-bold text-lg py-4 px-12 rounded-full transition-all duration-300 hover:scale-[1.04] hover:shadow-glow-accent active:scale-95 flex items-center gap-3 animate-slide-up"
          style={{ animationDelay: '320ms' }}
        >
          {/* Shine sweep */}
          <span className="pointer-events-none absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out bg-gradient-to-r from-transparent via-white/40 to-transparent" />
          Get Started
          <ArrowRight className="relative w-5 h-5 transition-transform duration-300 group-hover:translate-x-1.5" />
        </button>

        {/* Feature chips */}
        <div className="mt-12 flex flex-wrap justify-center gap-3 animate-slide-up" style={{ animationDelay: '420ms' }}>
          {[
            { icon: Globe2, label: 'Global city search' },
            { icon: Clock3, label: 'Hourly precision' },
            { icon: Sun, label: '5-day outlook' },
          ].map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-2 glass rounded-full px-4 py-2 text-sm text-slate-300 hover:bg-white/10 hover:text-white transition-colors duration-300"
            >
              <Icon className="w-4 h-4 text-accent" />
              {label}
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-6 inset-x-0 text-center text-slate-500 text-sm">
        © 2026 Developed by Muhammad Awais Altaf
      </div>
    </div>
  );
}

export default LandingPage;