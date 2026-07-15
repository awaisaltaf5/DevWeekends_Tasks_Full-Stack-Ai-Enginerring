function ForecastDay({ day, iconUrl, tempHigh, tempLow, condition, isToday }) {
  return (
    <div className="glass rounded-xl p-3 flex flex-col items-center gap-2 transition-all duration-200 hover:bg-white/10 min-w-[80px]">
      <p className="text-slate-400 text-sm font-medium">
        {isToday ? 'Today' : day}
      </p>
      
      {iconUrl && (
        <img 
          src={iconUrl} 
          alt={condition}
          className="w-10 h-10"
        />
      )}
      
      <div className="flex flex-col items-center">
        <span className="text-white font-bold text-lg">
          {Math.round(tempHigh)}°
        </span>
        <span className="text-slate-500 text-sm">
          {Math.round(tempLow)}°
        </span>
      </div>
    </div>
  );
}

export default ForecastDay;