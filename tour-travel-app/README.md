# 🌍 SnapTrips – Modern Travel & Tour Booking Platform

A modern, fully responsive **Travel & Tour Booking** web application built with **React 18**, **Vite**, and **Tailwind CSS**. SnapTrips delivers a seamless travel planning experience with **real-time destination validation**, **live weather updates**, **iconic landmark images**, **dark mode**, and a beautiful mobile-first user interface.

## 🚀 Live Demo

🔗 **https://snaptour-trip.netlify.app/**

---

# ✨ Features

* 🔍 **Real-Time Location Search**

  * Validate destinations using the OpenStreetMap (Nominatim) API.

* 🌤️ **Live Weather Information**

  * Displays the current weather, temperature, humidity, and weather conditions for searched destinations using the OpenWeather API.

* 📸 **Iconic Destination Photos**

  * Fetch beautiful landmark images from the Unsplash API.

* 🌙 **Dark Mode**

  * Persistent theme switching across the application.

* ❤️ **Favorite Destinations**

  * Save and manage your favorite travel destinations.

* 🎯 **Advanced Filtering & Sorting**

  * Filter destinations by category and sort by popularity, rating, or price.

* 📱 **Fully Responsive Design**

  * Optimized for desktop, tablet, and mobile devices.

* ⚡ **Lightning Fast Performance**

  * Built with Vite for instant HMR and optimized production builds.

* 🎨 **Modern User Interface**

  * Clean layouts, smooth animations, and intuitive navigation.

---

# 🛠️ Tech Stack

| Category   | Technology                                               |
| ---------- | -------------------------------------------------------- |
| Framework  | React 18                                                 |
| Build Tool | Vite                                                     |
| Styling    | Tailwind CSS                                             |
| Routing    | React Router DOM v6                                      |
| Icons      | Lucide React                                             |
| APIs       | OpenStreetMap (Nominatim), Unsplash API, OpenWeather API |
| Deployment | Netlify                                                  |

---

# 📁 Project Structure

```text
snaptrips/
├── public/
├── src/
│   ├── components/
│   │   ├── atoms/
│   │   ├── molecules/
│   │   ├── organisms/
│   │   └── templates/
│   │
│   ├── contexts/
│   │   ├── AuthContext
│   │   ├── SearchContext
│   │   └── ThemeContext
│   │
│   ├── data/
│   ├── pages/
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
│
├── .env
├── package.json
├── tailwind.config.js
├── vite.config.js
└── postcss.config.js
```

---

# ⚙️ Getting Started

## Prerequisites

* Node.js 18+
* npm 9+

---

## Clone the Repository

```bash
git clone https://github.com/awaisaltaf5/SnapTrips.git

cd SnapTrips
```

---

## Install Dependencies

```bash
npm install
```

---

## Environment Variables

Create a `.env` file in the project root.

```env
VITE_UNSPLASH_ACCESS_KEY=your_unsplash_access_key
VITE_OPENWEATHER_API_KEY=your_openweather_api_key
```

> **Note:** If the Unsplash API key is not provided, the application will automatically use fallback destination images.

---

## Run the Development Server

```bash
npm run dev
```

Open:

```text
http://localhost:5173
```

---

## Build for Production

```bash
npm run build
```

---

# 🌐 Deployment

SnapTrips is deployed on **Netlify**.

### Live Demo

https://snaptour-trip.netlify.app/

To deploy your own version:

```bash
npm run build
```

Then either:

* Upload the **dist** folder to Netlify Drop.
* Connect your GitHub repository for automatic deployments.

Remember to add the required environment variables inside your Netlify project settings.

---

# 📸 Pages

## 🏠 Home

* Full-screen hero section
* Destination search
* Popular destination tags
* Guest selector
* Featured destinations
* Testimonial carousel
* Newsletter subscription

---

## 🗺️ Destinations

* Real-time destination validation
* Live weather information
* Iconic destination images
* Category filters
* Search functionality
* Sorting options
* Favorite destinations
* Empty state handling

---

## 📦 Packages

* Curated travel packages
* Package pricing
* Filters and sorting
* Responsive cards

---

## ℹ️ About

* Company story
* Mission & Vision
* Statistics
* Team members
* Core values
* Trust badges

---

# 🧩 Shared Components

* Responsive Navbar
* Footer
* Scroll-to-Top Button
* Login Modal
* Dark Mode Toggle
* Newsletter Section
* Destination Cards
* Package Cards
* Testimonial Carousel

---

# 🔌 API Integrations

| API                       | Purpose                                                                |
| ------------------------- | ---------------------------------------------------------------------- |
| OpenStreetMap (Nominatim) | Validate searched locations                                            |
| Unsplash API              | Fetch iconic landmark images                                           |
| OpenWeather API           | Display current weather, temperature, humidity, and weather conditions |

---

# 🎨 Design System

## Colors

| Color           | Value     |
| --------------- | --------- |
| Primary         | `#14b8a6` |
| Primary Light   | `#5eead4` |
| Primary Dark    | `#0f766e` |
| Secondary       | `#f59e0b` |
| Dark Background | `#111827` |

### Typography

* Inter
* system-ui

### Layout

* Mobile-first approach
* Responsive Grid
* Custom container width
* Consistent spacing

---

# ✅ Features Checklist

* ✅ Real-time destination validation
* ✅ Live weather updates
* ✅ Iconic destination photos
* ✅ Responsive design
* ✅ Dark mode
* ✅ Mobile navigation
* ✅ Favorite destinations
* ✅ Category filtering
* ✅ Sorting options
* ✅ Scroll-to-top button
* ✅ Testimonial carousel
* ✅ Newsletter section

---

# 🚀 Future Improvements

* User Authentication
* Booking & Payment Integration
* Interactive Maps (Google Maps / Leaflet)
* User Dashboard
* Saved Trips
* Booking History
* Multi-language Support (i18n)
* Progressive Web App (PWA)
* Backend API Integration

---

# 📄 License

This project is licensed under the **MIT License**.

---

# 🙏 Acknowledgements

Special thanks to the following amazing tools and services:

* React
* Vite
* Tailwind CSS
* Unsplash
* OpenStreetMap (Nominatim)
* OpenWeather API
* Lucide React
* Netlify

---

# 👨‍💻 Author

## Muhammad Awais Altaf

* GitHub: https://github.com/awaisaltaf5

---

⭐ **If you like this project, consider giving it a star on GitHub!**
