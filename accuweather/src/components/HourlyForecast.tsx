import { useRef } from 'react';

function HourlyForecast({ hourlyData }) {
  const scrollRef = useRef(null);

  // Mock hourly data if none provided
  const defaultHourly = [
    { time: 'Now', temp: 24, icon: '01d' },
    { time: '12 PM', temp: 26, icon: '02d' },
    { time: '1 PM', temp: 28, icon: '03d' },
    { time: '2 PM', temp: 28, icon: '03d' },
    { time: '3 PM', temp: 29, icon: '02d' },
    { time: '4 PM', temp: 29, icon: '01d' },
    { time: '5 PM', temp: 29, icon: '01d' },
    { time: '6 PM', temp: 28, icon: '02d' },
    { time: '7 PM', temp: 27, icon: '03d' },
    { time: '8 PM', temp: 27, icon: '04d' },
    { time: '9 PM', temp: 25, icon: '04n' },
    { time: '10 PM', temp: 24, icon: '02n' },
  ];

  const data = hourlyData || defaultHourly;

  const getIconUrl = (iconCode) => {
    return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  };

  return (
    <div className="glass rounded-2xl p-4 sm:p-6">
      <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">
        Hourly Forecast
      </h3>
      
      <div 
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {data.map((hour, index) => (
          <div
            key={index}
            className={`flex flex-col items-center gap-2 min-w-[60px] p-3 rounded-xl transition-all ${
              index === 0 
                ? 'bg-accent/20 border border-accent/30' 
                : 'hover:bg-white/5'
            }`}
          >
            <p className="text-slate-400 text-xs font-medium whitespace-nowrap">
              {hour.time}
            </p>
            
            {hour.icon && (
              <img 
                src={getIconUrl(hour.icon)} 
                alt="weather"
                className="w-8 h-8"
              />
            )}
            
            <p className="text-white font-bold text-sm">
              {Math.round(hour.temp)}°
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default HourlyForecast;