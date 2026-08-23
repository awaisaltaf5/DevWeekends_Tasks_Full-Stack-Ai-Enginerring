import { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage';
import WeatherDashboard from './components/WeatherDashboard';
import SearchModal from './components/SearchModal';

function App() {
  const [currentView, setCurrentView] = useState('landing');
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [currentCity, setCurrentCity] = useState('London');
  const [locationMode, setLocationMode] = useState('default'); // 'default' | 'location' | 'city'

  // On mount: try to get location if previously allowed
  useEffect(() => {
    const savedMode = localStorage.getItem('weatherApp_locationMode');
    if (savedMode === 'location') {
      setLocationMode('location');
    }
  }, []);

  const handleGetStarted = () => {
    setCurrentView('dashboard');
  };

  const handleCitySelect = (city) => {
    setLocationMode('city');
    setCurrentCity(city);
    localStorage.setItem('weatherApp_locationMode', 'city');
    setIsSearchModalOpen(false);
  };

  const handleLocationMode = () => {
    setLocationMode('location');
    localStorage.setItem('weatherApp_locationMode', 'location');
  };

  return (
    <div className="min-h-screen bg-dark-bg text-white font-sans antialiased">
      {currentView === 'landing' && (
        <LandingPage onGetStarted={handleGetStarted} />
      )}
      
      {currentView === 'dashboard' && (
        <WeatherDashboard 
          city={currentCity}
          locationMode={locationMode}
          onOpenSearch={() => setIsSearchModalOpen(true)}
          onLocationMode={handleLocationMode}
        />
      )}

      {isSearchModalOpen && (
        <SearchModal 
          onClose={() => setIsSearchModalOpen(false)}
          onCitySelect={handleCitySelect}
        />
      )}
    </div>
  );
}

export default App;