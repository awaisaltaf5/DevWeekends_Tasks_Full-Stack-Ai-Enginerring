// Format date to day name
export const formatDay = (timestamp) => {
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString('en-US', { weekday: 'short' });
};

// Format time from timestamp
export const formatTime = (timestamp) => {
  const date = new Date(timestamp * 1000);
  return date.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    hour12: true 
  });
};

// Get current day name
export const getCurrentDay = () => {
  return new Date().toLocaleDateString('en-US', { weekday: 'long' });
};

// Convert wind speed from m/s to km/h
export const msToKmh = (speed) => {
  return (speed * 3.6).toFixed(1);
};

// Convert visibility from meters to kilometers
export const mToKm = (visibility) => {
  return (visibility / 1000).toFixed(1);
};

// Process forecast data into daily format
export const processDailyForecast = (list) => {
  const daily = {};
  
  list.forEach((item) => {
    const date = new Date(item.dt * 1000).toLocaleDateString('en-US', { weekday: 'short' });
    
    if (!daily[date]) {
      daily[date] = {
        day: date,
        temps: [],
        icons: [],
        conditions: [],
      };
    }
    
    daily[date].temps.push(item.main.temp);
    daily[date].icons.push(item.weather[0].icon);
    daily[date].conditions.push(item.weather[0].description);
  });
  
  return Object.values(daily).slice(0, 5).map((day) => ({
    day: day.day,
    tempHigh: Math.max(...day.temps),
    tempLow: Math.min(...day.temps),
    icon: day.icons[Math.floor(day.icons.length / 2)], // Middle icon
    condition: day.conditions[0],
    isToday: day.day === new Date().toLocaleDateString('en-US', { weekday: 'short' }),
  }));
};

// Process hourly forecast (next 12 hours)
export const processHourlyForecast = (list) => {
  return list.slice(0, 12).map((item, index) => ({
    time: index === 0 ? 'Now' : formatTime(item.dt),
    temp: item.main.temp,
    icon: item.weather[0].icon,
  }));
};