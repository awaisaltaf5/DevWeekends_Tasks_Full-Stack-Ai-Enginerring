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
<img width="300" height="150" alt="markmap" src="https://github.com/user-attachments/assets/8ea2af8a-0518-4cc7-8296-42d125f23a8e" />

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
<svg xmlns="http://www.w3.org/2000/svg" class="markmap mm-i7fkwp-2" style="width: 100%; height: 100%;"><style>.markmap{--markmap-max-width: 9999px;--markmap-a-color: #0097e6;--markmap-a-hover-color: #00a8ff;--markmap-code-bg: #f0f0f0;--markmap-code-color: #555;--markmap-highlight-bg: #ffeaa7;--markmap-table-border: 1px solid currentColor;--markmap-font: 300 16px/20px sans-serif;--markmap-circle-open-bg: #fff;--markmap-text-color: #333;--markmap-highlight-node-bg: #ff02;font:var(--markmap-font);color:var(--markmap-text-color)}.markmap-link{fill:none}.markmap-node&gt;circle{cursor:pointer}.markmap-foreign{display:inline-block}.markmap-foreign p{margin:0}.markmap-foreign a{color:var(--markmap-a-color)}.markmap-foreign a:hover{color:var(--markmap-a-hover-color)}.markmap-foreign code{padding:.25em;font-size:calc(1em - 2px);color:var(--markmap-code-color);background-color:var(--markmap-code-bg);border-radius:2px}.markmap-foreign pre{margin:0}.markmap-foreign pre&gt;code{display:block}.markmap-foreign del{text-decoration:line-through}.markmap-foreign em{font-style:italic}.markmap-foreign strong{font-weight:700}.markmap-foreign mark{background:var(--markmap-highlight-bg)}.markmap-foreign table,.markmap-foreign th,.markmap-foreign td{border-collapse:collapse;border:var(--markmap-table-border)}.markmap-foreign img{display:inline-block}.markmap-foreign svg{fill:currentColor}.markmap-foreign&gt;div{width:var(--markmap-max-width);text-align:left}.markmap-foreign&gt;div&gt;div{display:inline-block}.markmap-highlight rect{fill:var(--markmap-highlight-node-bg)}.markmap-dark .markmap{--markmap-code-bg: #1a1b26;--markmap-code-color: #ddd;--markmap-circle-open-bg: #444;--markmap-text-color: #eee}</style><g transform="translate(20,304.82033972125436) scale(0.662020905923345)"><path class="markmap-link" data-depth="3" data-path="1.2.3" d="M323,-182.187C363,-182.187,363,-88.875,403,-88.875" stroke-width="1.375" stroke="rgb(44, 160, 44)"/><path class="markmap-link" data-depth="3" data-path="1.4.5" d="M337,21.813C377,21.813,377,-57.5,417,-57.5" stroke-width="1.375" stroke="rgb(148, 103, 189)"/><path class="markmap-link" data-depth="3" data-path="1.4.6" d="M337,21.813C377,21.813,377,-31.125,417,-31.125" stroke-width="1.375" stroke="rgb(140, 86, 75)"/><path class="markmap-link" data-depth="3" data-path="1.4.7" d="M337,21.813C377,21.813,377,-4.75,417,-4.75" stroke-width="1.375" stroke="rgb(227, 119, 194)"/><path class="markmap-link" data-depth="3" data-path="1.4.8" d="M337,21.813C377,21.813,377,21.625,417,21.625" stroke-width="1.375" stroke="rgb(127, 127, 127)"/><path class="markmap-link" data-depth="3" data-path="1.4.9" d="M337,21.813C377,21.813,377,48,417,48" stroke-width="1.375" stroke="rgb(188, 189, 34)"/><path class="markmap-link" data-depth="3" data-path="1.4.10" d="M337,21.813C377,21.813,377,74.375,417,74.375" stroke-width="1.375" stroke="rgb(23, 190, 207)"/><path class="markmap-link" data-depth="3" data-path="1.4.11" d="M337,21.813C377,21.813,377,100.75,417,100.75" stroke-width="1.375" stroke="rgb(31, 119, 180)"/><path class="markmap-link" data-depth="4" data-path="1.12.13.14" d="M556,158.313C596,158.313,596,132.031,636,132.031" stroke-width="1.1875" stroke="rgb(214, 39, 40)"/><path class="markmap-link" data-depth="4" data-path="1.12.13.15" d="M556,158.313C596,158.313,596,158.219,636,158.219" stroke-width="1.1875" stroke="rgb(148, 103, 189)"/><path class="markmap-link" data-depth="4" data-path="1.12.13.16" d="M556,158.313C596,158.313,596,184.406,636,184.406" stroke-width="1.1875" stroke="rgb(140, 86, 75)"/><path class="markmap-link" data-depth="4" data-path="1.12.17.18" d="M540,249.188C580,249.188,580,282.594,620,282.594" stroke-width="1.1875" stroke="rgb(127, 127, 127)"/><path class="markmap-link" data-depth="3" data-path="1.12.13" d="M367,203.938C407,203.938,407,158.313,447,158.313" stroke-width="1.375" stroke="rgb(44, 160, 44)"/><path class="markmap-link" data-depth="3" data-path="1.12.17" d="M367,203.938C407,203.938,407,249.188,447,249.188" stroke-width="1.375" stroke="rgb(227, 119, 194)"/><path class="markmap-link" data-depth="2" data-path="1.2" d="M137,11.25C177,11.25,177,-182.187,217,-182.187" stroke-width="1.75" stroke="rgb(255, 127, 14)"/><path class="markmap-link" data-depth="2" data-path="1.4" d="M137,11.25C177,11.25,177,21.813,217,21.813" stroke-width="1.75" stroke="rgb(214, 39, 40)"/><path class="markmap-link" data-depth="2" data-path="1.12" d="M137,11.25C177,11.25,177,203.938,217,203.938" stroke-width="1.75" stroke="rgb(255, 127, 14)"/><g class="markmap-highlight"/><g data-depth="3" data-path="1.2.3" class="markmap-node" transform="translate(403, -296.5625)"><line stroke="#2ca02c" stroke-width="1.375" x1="-1" x2="747" y1="207.6875" y2="207.6875"/><foreignObject class="markmap-foreign" x="8" y="0" style="opacity: 1;" width="729" height="207"><div xmlns="http://www.w3.org/1999/xhtml"><div xmlns="http://www.w3.org/1999/xhtml"><table data-lines="10,21">
<thead data-lines="10,11">
<tr data-lines="10,11">
<th>Feature</th>
<th>Description</th>
</tr>
</thead>
<tbody data-lines="12,21">
<tr data-lines="12,13">
<td>🔍 <strong>City Search</strong></td>
<td>Search for any city worldwide with autocomplete suggestions</td>
</tr>
<tr data-lines="13,14">
<td>📍 <strong>Current Location</strong></td>
<td>One-click access to your local weather using browser geolocation</td>
</tr>
<tr data-lines="14,15">
<td>🌡️ <strong>Live Weather Data</strong></td>
<td>Real-time temperature, humidity, wind speed, pressure, visibility, and more</td>
</tr>
<tr data-lines="15,16">
<td>🖼️ <strong>Dynamic Backgrounds</strong></td>
<td>Background images change based on current weather conditions</td>
</tr>
<tr data-lines="16,17">
<td>📊 <strong>Hourly Forecast</strong></td>
<td>Scrollable 12-hour temperature and condition timeline</td>
</tr>
<tr data-lines="17,18">
<td>📅 <strong>5-Day Forecast</strong></td>
<td>Daily high/low temperatures with weather icons</td>
</tr>
<tr data-lines="18,19">
<td>🔄 <strong>Recent Searches</strong></td>
<td>Quick access to last 5 searched cities (persisted in localStorage)</td>
</tr>
<tr data-lines="19,20">
<td>🌙 <strong>Dark Theme</strong></td>
<td>Modern glassmorphism UI with deep navy color scheme</td>
</tr>
<tr data-lines="20,21">
<td>📱 <strong>Fully Responsive</strong></td>
<td>Optimized for mobile, tablet, and desktop devices</td>
</tr>
</tbody>
</table></div></div></foreignObject></g><g data-depth="2" data-path="1.2" class="markmap-node" transform="translate(217, -203.0625)"><line stroke="#ff7f0e" stroke-width="1.75" x1="-1" x2="108" y1="20.875" y2="20.875"/><circle stroke-width="1.5" r="6" stroke="#ff7f0e" fill="var(--markmap-circle-open-bg)" cx="106" cy="20.875"/><foreignObject class="markmap-foreign" x="8" y="0" style="opacity: 1;" width="90" height="20"><div xmlns="http://www.w3.org/1999/xhtml"><div xmlns="http://www.w3.org/1999/xhtml">✨ Features</div></div></foreignObject></g><g data-depth="3" data-path="1.4.5" class="markmap-node" transform="translate(417, -78.1875)"><line stroke="#9467bd" stroke-width="1.375" x1="-1" x2="173" y1="20.6875" y2="20.6875"/><foreignObject class="markmap-foreign" x="8" y="0" style="opacity: 1;" width="155" height="20"><div xmlns="http://www.w3.org/1999/xhtml"><div xmlns="http://www.w3.org/1999/xhtml"><strong>React 18</strong> — UI library</div></div></foreignObject></g><g data-depth="3" data-path="1.4.6" class="markmap-node" transform="translate(417, -51.8125)"><line stroke="#8c564b" stroke-width="1.375" x1="-1" x2="248" y1="20.6875" y2="20.6875"/><foreignObject class="markmap-foreign" x="8" y="0" style="opacity: 1;" width="230" height="20"><div xmlns="http://www.w3.org/1999/xhtml"><div xmlns="http://www.w3.org/1999/xhtml"><strong>Vite</strong> — Build tool and dev server</div></div></foreignObject></g><g data-depth="3" data-path="1.4.7" class="markmap-node" transform="translate(417, -25.4375)"><line stroke="#e377c2" stroke-width="1.375" x1="-1" x2="330" y1="20.6875" y2="20.6875"/><foreignObject class="markmap-foreign" x="8" y="0" style="opacity: 1;" width="312" height="20"><div xmlns="http://www.w3.org/1999/xhtml"><div xmlns="http://www.w3.org/1999/xhtml"><strong>Tailwind CSS</strong> — Utility-first CSS framework</div></div></foreignObject></g><g data-depth="3" data-path="1.4.8" class="markmap-node" transform="translate(417, 0.9375001192092896)"><line stroke="#7f7f7f" stroke-width="1.375" x1="-1" x2="221" y1="20.6875" y2="20.6875"/><foreignObject class="markmap-foreign" x="8" y="0" style="opacity: 1;" width="203" height="20"><div xmlns="http://www.w3.org/1999/xhtml"><div xmlns="http://www.w3.org/1999/xhtml"><strong>Lucide React</strong> — Icon library</div></div></foreignObject></g><g data-depth="3" data-path="1.4.9" class="markmap-node" transform="translate(417, 27.3125)"><line stroke="#bcbd22" stroke-width="1.375" x1="-1" x2="305" y1="20.6875" y2="20.6875"/><foreignObject class="markmap-foreign" x="8" y="0" style="opacity: 1;" width="287" height="20"><div xmlns="http://www.w3.org/1999/xhtml"><div xmlns="http://www.w3.org/1999/xhtml"><strong>OpenWeatherMap API</strong> — Weather data</div></div></foreignObject></g><g data-depth="3" data-path="1.4.10" class="markmap-node" transform="translate(417, 53.6875)"><line stroke="#17becf" stroke-width="1.375" x1="-1" x2="528" y1="20.6875" y2="20.6875"/><foreignObject class="markmap-foreign" x="8" y="0" style="opacity: 1;" width="510" height="20"><div xmlns="http://www.w3.org/1999/xhtml"><div xmlns="http://www.w3.org/1999/xhtml"><strong>OpenWeatherMap Geocoding API</strong> — City search &amp; reverse geocoding</div></div></foreignObject></g><g data-depth="3" data-path="1.4.11" class="markmap-node" transform="translate(417, 80.0625)"><line stroke="#1f77b4" stroke-width="1.375" x1="-1" x2="383" y1="20.6875" y2="20.6875"/><foreignObject class="markmap-foreign" x="8" y="0" style="opacity: 1;" width="365" height="20"><div xmlns="http://www.w3.org/1999/xhtml"><div xmlns="http://www.w3.org/1999/xhtml"><strong>Unsplash</strong> — Dynamic weather background images</div></div></foreignObject></g><g data-depth="2" data-path="1.4" class="markmap-node" transform="translate(217, 0.9375001192092896)"><line stroke="#d62728" stroke-width="1.75" x1="-1" x2="122" y1="20.875" y2="20.875"/><circle stroke-width="1.5" r="6" stroke="#d62728" fill="var(--markmap-circle-open-bg)" cx="120" cy="20.875"/><foreignObject class="markmap-foreign" x="8" y="0" style="opacity: 1;" width="104" height="20"><div xmlns="http://www.w3.org/1999/xhtml"><div xmlns="http://www.w3.org/1999/xhtml">🛠️ Tech Stack</div></div></foreignObject></g><g data-depth="4" data-path="1.12.13.14" class="markmap-node" transform="translate(636, 111.4375)"><line stroke="#d62728" stroke-width="1.1875" x1="-1" x2="181" y1="20.59375" y2="20.59375"/><foreignObject class="markmap-foreign" x="8" y="0" style="opacity: 1;" width="163" height="20"><div xmlns="http://www.w3.org/1999/xhtml"><div xmlns="http://www.w3.org/1999/xhtml"><a href="https://nodejs.org/">Node.js</a> (v18 or higher)</div></div></foreignObject></g><g data-depth="4" data-path="1.12.13.15" class="markmap-node" transform="translate(636, 137.625)"><line stroke="#9467bd" stroke-width="1.1875" x1="-1" x2="103" y1="20.59375" y2="20.59375"/><foreignObject class="markmap-foreign" x="8" y="0" style="opacity: 1;" width="85" height="20"><div xmlns="http://www.w3.org/1999/xhtml"><div xmlns="http://www.w3.org/1999/xhtml"><a href="https://www.npmjs.com/">npm</a> or <a href="https://yarnpkg.com/">yarn</a></div></div></foreignObject></g><g data-depth="4" data-path="1.12.13.16" class="markmap-node" transform="translate(636, 163.8125)"><line stroke="#8c564b" stroke-width="1.1875" x1="-1" x2="279" y1="20.59375" y2="20.59375"/><foreignObject class="markmap-foreign" x="8" y="0" style="opacity: 1;" width="261" height="20"><div xmlns="http://www.w3.org/1999/xhtml"><div xmlns="http://www.w3.org/1999/xhtml"><a href="https://openweathermap.org/api">OpenWeatherMap API Key</a> (free tier)</div></div></foreignObject></g><g data-depth="3" data-path="1.12.13" class="markmap-node" transform="translate(447, 137.625)"><line stroke="#2ca02c" stroke-width="1.375" x1="-1" x2="111" y1="20.6875" y2="20.6875"/><circle stroke-width="1.5" r="6" stroke="#2ca02c" fill="var(--markmap-circle-open-bg)" cx="109" cy="20.6875"/><foreignObject class="markmap-foreign" x="8" y="0" style="opacity: 1;" width="93" height="20"><div xmlns="http://www.w3.org/1999/xhtml"><div xmlns="http://www.w3.org/1999/xhtml">Prerequisites</div></div></foreignObject></g><g data-depth="4" data-path="1.12.17.18" class="markmap-node" transform="translate(620, 195)"><line stroke="#7f7f7f" stroke-width="1.1875" x1="-1" x2="386" y1="87.59375" y2="87.59375"/><foreignObject class="markmap-foreign" x="8" y="0" style="opacity: 1;" width="368" height="87"><div xmlns="http://www.w3.org/1999/xhtml"><div xmlns="http://www.w3.org/1999/xhtml">1. 
<p data-lines="46,47"><strong>Clone the repository</strong></p>
<pre data-lines="48,51"><code class="language-bash">git <span class="hljs-built_in">clone</span> https://github.com/yourusername/accuweather.git
<span class="hljs-built_in">cd</span> accuweather</code></pre></div></div></foreignObject></g><g data-depth="3" data-path="1.12.17" class="markmap-node" transform="translate(447, 228.5)"><line stroke="#e377c2" stroke-width="1.375" x1="-1" x2="95" y1="20.6875" y2="20.6875"/><circle stroke-width="1.5" r="6" stroke="#e377c2" fill="var(--markmap-circle-open-bg)" cx="93" cy="20.6875"/><foreignObject class="markmap-foreign" x="8" y="0" style="opacity: 1;" width="77" height="20"><div xmlns="http://www.w3.org/1999/xhtml"><div xmlns="http://www.w3.org/1999/xhtml">Installation</div></div></foreignObject></g><g data-depth="2" data-path="1.12" class="markmap-node" transform="translate(217, 183.0625)"><line stroke="#ff7f0e" stroke-width="1.75" x1="-1" x2="152" y1="20.875" y2="20.875"/><circle stroke-width="1.5" r="6" stroke="#ff7f0e" fill="var(--markmap-circle-open-bg)" cx="150" cy="20.875"/><foreignObject class="markmap-foreign" x="8" y="0" style="opacity: 1;" width="134" height="20"><div xmlns="http://www.w3.org/1999/xhtml"><div xmlns="http://www.w3.org/1999/xhtml">🚀 Getting Started</div></div></foreignObject></g><g data-depth="1" data-path="1" class="markmap-node" transform="translate(0, -10)"><line stroke="#1f77b4" stroke-width="2.5" x1="-1" x2="139" y1="21.25" y2="21.25"/><circle stroke-width="1.5" r="6" stroke="#1f77b4" fill="var(--markmap-circle-open-bg)" cx="137" cy="21.25"/><foreignObject class="markmap-foreign" x="8" y="0" style="opacity: 1;" width="121" height="20"><div xmlns="http://www.w3.org/1999/xhtml"><div xmlns="http://www.w3.org/1999/xhtml">🌤️ AccuWeather</div></div></foreignObject></g></g></svg>
