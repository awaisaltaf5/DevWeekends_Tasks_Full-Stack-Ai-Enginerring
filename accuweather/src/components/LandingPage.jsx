import { useEffect, useRef } from 'react';
import { CloudRain, ArrowRight } from 'lucide-react';

function LandingPage({ onGetStarted }) {
  const buttonRef = useRef(null);

  useEffect(() => {
    buttonRef.current?.focus();
  }, []);

  return (
    <div className="min-h-screen bg-dark-bg flex flex-col items-center justify-center relative overflow-hidden animate-fade-in">
      
      {/* Animated background elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-dark-bg via-dark-bg to-dark-card opacity-50" />
      <div className="absolute top-20 left-20 w-72 h-72 bg-accent/5 rounded-full blur-3xl animate-pulse-slow" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-sky-500/5 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-4">
        
        {/* Weather Icon */}
        <div className="mb-8 relative group">
          <div className="w-24 h-24 rounded-full bg-accent/10 flex items-center justify-center transition-transform duration-500 group-hover:scale-110">
            <CloudRain className="w-12 h-12 text-accent" />
          </div>
          <div className="absolute inset-0 w-24 h-24 rounded-full bg-accent/20 blur-xl -z-10 animate-pulse-slow" />
        </div>

        {/* Title */}
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white mb-4 tracking-tight">
          Accu<span className="text-accent">Weather</span>
        </h1>

        {/* Tagline */}
        <p className="text-lg sm:text-xl text-slate-400 mb-12 max-w-md">
          Real-time forecasts, anywhere
        </p>

        {/* Get Started Button */}
        <button
          ref={buttonRef}
          onClick={onGetStarted}
          className="group bg-accent hover:bg-accent-hover text-black font-bold text-lg py-4 px-10 rounded-full transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-accent/25 active:scale-95 flex items-center gap-3"
        >
          Get Started
          <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
        </button>
      </div>

      {/* Footer */}
      <div className="absolute bottom-6 text-slate-500 text-sm">
        © 2026 Developed by Muhammad Awais Altaf
      </div>
    </div>
  );
}

export default LandingPage;