// Weather condition to background image mapping
// Using reliable image URLs that won't break

const weatherBackgrounds = {
  'clear sky': [
    'https://images.unsplash.com/photo-1601297183305-6df142704ea2?w=1920&q=80',
    'https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?w=1920&q=80',
  ],
  'few clouds': [
    'https://images.unsplash.com/photo-1534088568595-a066f410bcda?w=1920&q=80',
    'https://images.unsplash.com/photo-1594156596782-656c93e4d504?w=1920&q=80',
  ],
  'scattered clouds': [
    'https://images.unsplash.com/photo-1534088568595-a066f410bcda?w=1920&q=80',
    'https://images.unsplash.com/photo-1529528744093-6f8abeee511d?w=1920&q=80',
  ],
  'broken clouds': [
    'https://images.unsplash.com/photo-1534088568595-a066f410bcda?w=1920&q=80',
    'https://images.unsplash.com/photo-1499956827185-0d63ee78a910?w=1920&q=80',
  ],
  'overcast clouds': [
    'https://images.unsplash.com/photo-1499956827185-0d63ee78a910?w=1920&q=80',
    'https://images.unsplash.com/photo-1534088568595-a066f410bcda?w=1920&q=80',
  ],
  'shower rain': [
    'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?w=1920&q=80',
    'https://images.unsplash.com/photo-1428592953211-077101b2021b?w=1920&q=80',
  ],
  'rain': [
    'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?w=1920&q=80',
    'https://images.unsplash.com/photo-1428592953211-077101b2021b?w=1920&q=80',
  ],
  'light rain': [
    'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?w=1920&q=80',
    'https://images.unsplash.com/photo-1519692933481-e162a57d6721?w=1920&q=80',
  ],
  'moderate rain': [
    'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?w=1920&q=80',
    'https://images.unsplash.com/photo-1428592953211-077101b2021b?w=1920&q=80',
  ],
  'heavy rain': [
    'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?w=1920&q=80',
    'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1920&q=80',
  ],
  'thunderstorm': [
    'https://images.unsplash.com/photo-1605727216801-e27ce1d0cc28?w=1920&q=80',
    'https://images.unsplash.com/photo-1513002749550-c59d786b8e6c?w=1920&q=80',
  ],
  'snow': [
    'https://images.unsplash.com/photo-1491002052546-bf38f186af56?w=1920&q=80',
    'https://images.unsplash.com/photo-1517299321609-52687d1bc55a?w=1920&q=80',
  ],
  'mist': [
    'https://images.unsplash.com/photo-1487621167305-5d248087c724?w=1920&q=80',
    'https://images.unsplash.com/photo-1543968996-ee822b8176ba?w=1920&q=80',
  ],
  'fog': [
    'https://images.unsplash.com/photo-1487621167305-5d248087c724?w=1920&q=80',
    'https://images.unsplash.com/photo-1543968996-ee822b8176ba?w=1920&q=80',
  ],
  'haze': [
    'https://images.unsplash.com/photo-1543968996-ee822b8176ba?w=1920&q=80',
    'https://images.unsplash.com/photo-1487621167305-5d248087c724?w=1920&q=80',
  ],
  'default': [
    'https://images.unsplash.com/photo-1601297183305-6df142704ea2?w=1920&q=80',
    'https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?w=1920&q=80',
  ],
};

// Get a random image from the array to add variety
const getRandomImage = (images) => {
  const index = Math.floor(Math.random() * images.length);
  return images[index];
};

export const getBackgroundImage = (weatherCondition) => {
  const condition = weatherCondition?.toLowerCase().trim() || '';
  
  // Try exact match first
  if (weatherBackgrounds[condition]) {
    return getRandomImage(weatherBackgrounds[condition]);
  }
  
  // Try partial match
  for (const [key, images] of Object.entries(weatherBackgrounds)) {
    if (condition.includes(key) || key.includes(condition)) {
      return getRandomImage(images);
    }
  }
  
  // Default fallback
  return getRandomImage(weatherBackgrounds['default']);
};

// Preload image to prevent flickering
export const preloadImage = (url) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(url);
    img.onerror = reject;
    img.src = url;
  });
};