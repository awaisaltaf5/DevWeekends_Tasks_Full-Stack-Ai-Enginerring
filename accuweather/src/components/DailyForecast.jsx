import ForecastDay from './ForecastDay';

function DailyForecast({ dailyData }) {
  // Mock 5-day data if none provided
  const defaultDaily = [
    { day: 'Mon', tempHigh: 24, tempLow: 18, icon: '01d', condition: 'sunny' },
    { day: 'Tue', tempHigh: 20, tempLow: 15, icon: '09d', condition: 'rain' },
    { day: 'Wed', tempHigh: 28, tempLow: 22, icon: '01d', condition: 'clear', isToday: true },
    { day: 'Thu', tempHigh: 25, tempLow: 19, icon: '03d', condition: 'clouds' },
    { day: 'Fri', tempHigh: 22, tempLow: 17, icon: '02d', condition: 'partly cloudy' },
  ];

  const data = dailyData || defaultDaily;

  const getIconUrl = (iconCode) => {
    return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  };

  return (
    <div className="glass rounded-2xl p-4 sm:p-6">
      <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">
        5-Day Forecast
      </h3>
      
      <div className="flex justify-between gap-2">
        {data.map((day, index) => (
          <ForecastDay
            key={index}
            day={day.day}
            iconUrl={getIconUrl(day.icon)}
            tempHigh={day.tempHigh}
            tempLow={day.tempLow}
            condition={day.condition}
            isToday={day.isToday}
          />
        ))}
      </div>
    </div>
  );
}

export default DailyForecast;