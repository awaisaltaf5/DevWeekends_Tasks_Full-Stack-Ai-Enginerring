import { MapPin, ExternalLink } from 'lucide-react'

export default function MapWidget({ location, mapUrl }) {
  // Use the search-based embed URL for better results
  const searchUrl = `https://maps.google.com/maps?q=${encodeURIComponent(location)}&t=&z=13&ie=UTF8&iwloc=&output=embed`
  
  // Direct link to open in Google Maps
  const directMapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md border border-gray-100 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <MapPin className="w-5 h-5 text-primary dark:text-primary-light" />
          Location
        </h3>
        <a
          href={directMapUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-primary dark:text-primary-light hover:underline flex items-center gap-1"
        >
          Open in Maps
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
      
      <div className="relative rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700 aspect-video">
        <iframe
          src={searchUrl}
          width="100%"
          height="100%"
          style={{ border: 0, minHeight: '300px' }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title={`Map of ${location}`}
          className="absolute inset-0"
        />
      </div>
      
      <p className="mt-3 text-sm text-gray-500 dark:text-gray-400 text-center">
        Interactive map of {location}
      </p>
    </div>
  )
}