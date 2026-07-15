function WeatherDetail({ icon: Icon, label, value, unit }) {
  return (
    <div className="glass rounded-xl p-4 flex items-center gap-4 transition-all duration-200 hover:bg-white/10">
      <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
        <Icon className="w-5 h-5 text-accent" />
      </div>
      <div>
        <p className="text-slate-400 text-sm">{label}</p>
        <p className="text-white font-semibold text-lg">
          {value}
          {unit && <span className="text-slate-400 text-sm ml-1">{unit}</span>}
        </p>
      </div>
    </div>
  );
}

export default WeatherDetail;