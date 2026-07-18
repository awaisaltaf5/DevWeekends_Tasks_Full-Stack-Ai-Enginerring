# 🌤️ AccuWeather

A modern, responsive **Weather Web Application** built with **React 18**, **Vite**, and **Tailwind CSS**. The application provides real-time weather updates, hourly forecasts, and 5-day weather predictions with dynamic backgrounds based on current weather conditions.

🌐 **Live Demo:** https://accuweather-ten.vercel.app/

---

## ✨ Features

- 🔍 Search weather for any city worldwide
- 📍 Detect and display weather for your current location
- 🌡️ Real-time weather information
- 📅 5-Day weather forecast
- ⏰ 12-Hour hourly forecast
- 🌤️ Dynamic backgrounds based on weather conditions
- 💨 Display humidity, wind speed, pressure, visibility, and feels-like temperature
- 🕘 Recent searches stored using Local Storage
- 🌙 Modern Dark UI with Glassmorphism design
- 📱 Fully Responsive (Mobile, Tablet & Desktop)
- ⚡ Fast performance powered by Vite

---

## 🛠️ Tech Stack

- **React 18**
- **Vite**
- **Tailwind CSS**
- **Lucide React**
- **JavaScript (ES6+)**
- **Axios**

---

## 🔌 APIs Used

### 🌦️ OpenWeatherMap API

Used for:

- Current Weather
- 5-Day Weather Forecast
- Weather Icons
- Temperature
- Wind Speed
- Humidity
- Pressure
- Visibility

### 📍 OpenWeatherMap Geocoding API

Used for:

- City Search
- Reverse Geocoding
- Current Location Detection

### 🖼️ Unsplash

Used for:

- Dynamic weather background images based on current weather conditions.


## 📂 Project Structure

```bash
accuweather/
├── public/
│   └── vite.svg
│
├── src/
│   ├── components/
│   │   ├── LandingPage.jsx
│   │   ├── WeatherDashboard.jsx
│   │   ├── WeatherCard.jsx
│   │   ├── WeatherDetail.jsx
│   │   ├── HourlyForecast.jsx
│   │   ├── DailyForecast.jsx
│   │   ├── ForecastDay.jsx
│   │   ├── SearchModal.jsx
│   │   ├── SkeletonLoader.jsx
│   │   ├── ErrorMessage.jsx
│   │   └── LoadingSpinner.jsx
│   │
│   ├── services/
│   │   ├── weatherApi.js
│   │   └── backgroundService.js
│   │
│   ├── utils/
│   │   └── helpers.js
│   │
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
│
├── .env
├── .gitignore
├── index.html
├── package.json
├── tailwind.config.js
├── vite.config.js
└── README.md
```

---

# 🚀 Getting Started

## Prerequisites

- Node.js (v18 or later)
- npm or yarn
- OpenWeatherMap API Key

---

## Installation

### Clone the repository

```bash
git clone https://github.com/yourusername/accuweather.git
```

### Navigate into the project

```bash
cd accuweather
```

### Install dependencies

```bash
npm install
```

### Create Environment Variables

Create a `.env` file in the project root.

```env
VITE_OPENWEATHER_API_KEY=your_api_key_here
```

Get your free API key from:

https://openweathermap.org/api

### Start Development Server

```bash
npm run dev
```

Open:

```
http://localhost:5173
```

---

# 🔑 Environment Variables

Create a `.env` file.

| Variable | Description | Required |
|----------|-------------|-----------|
| `VITE_OPENWEATHER_API_KEY` | OpenWeatherMap API Key | ✅ |

> **Note:** Vite only exposes environment variables prefixed with `VITE_`.

---

# 📁 .env.example

```env
# Copy this file to .env

VITE_OPENWEATHER_API_KEY=your_api_key_here
```

---

# 📝 Available Scripts

| Command | Description |
|----------|-------------|
| `npm run dev` | Run development server |
| `npm run build` | Build production files |
| `npm run preview` | Preview production build |

---

# ⚙️ Key Implementation Details

## State Management

- `useState`
- `useEffect`
- `useRef`

---

## API Integration

### Current Weather

```
/weather?q={city}&units=metric
```

### 5-Day Forecast

```
/forecast?lat={lat}&lon={lon}&units=metric
```

### City Search

```
/geo/1.0/direct?q={query}&limit=5
```

### Reverse Geocoding

```
/geo/1.0/reverse?lat={lat}&lon={lon}
```

---

## Current Location

- Detects browser location
- Reverse geocodes coordinates
- Displays local weather
- Falls back to a default city if permission is denied

---

## Dynamic Backgrounds

Background images automatically change according to weather conditions:

- ☀️ Clear
- ☁️ Clouds
- 🌧️ Rain
- ⛈️ Thunderstorm
- ❄️ Snow

---

# 🚀 Deployment

The project is deployed on **Vercel**.

### Live Demo

https://accuweather-ten.vercel.app/

---

# 🐛 Troubleshooting

| Issue | Solution |
|--------|----------|
| API Key Missing | Check `.env` file |
| City Not Found | Verify spelling |
| Location Access Denied | Allow browser location permission |
| Background Not Updating | Wait a few seconds while the image loads |

---

# 🔮 Future Improvements

- ⭐ Save Favorite Cities
- 🌡️ Celsius / Fahrenheit Toggle
- 🌍 Weather Alerts
- 📊 Air Quality Index (AQI)
- 📱 Progressive Web App (PWA)
- 🎨 Animated Weather Icons
- 📅 7-Day Forecast

---

# 🤝 Contributing

Contributions are always welcome.

Feel free to fork the repository and submit a Pull Request.

---

# 👨‍💻 Author

**Muhammad Awais Altaf**

GitHub:
https://github.com/awaisaltaf5

---

# 🙏 Acknowledgements

- OpenWeatherMap
- Unsplash
- React
- Vite
- Tailwind CSS
- Lucide React

---

# ⭐ Support

If you found this project useful, consider giving it a **⭐ Star** on GitHub.

---

## 🌤️ Stay Updated with AccuWeather!
