import { useState } from 'react'
import { Hotel, UtensilsCrossed } from 'lucide-react'
import Heading from '../atoms/Heading'
import HotelCard from '../molecules/HotelCard'
import RestaurantCard from '../molecules/RestaurantCard'

export default function PlacesSection({ hotels, restaurants, location }) {
  const [activeTab, setActiveTab] = useState('hotels')

  return (
    <div className="mt-8">
      {/* Tabs */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => setActiveTab('hotels')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${
            activeTab === 'hotels'
              ? 'bg-primary text-white dark:bg-primary-light'
              : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200'
          }`}
        >
          <Hotel className="w-4 h-4" />
          Hotels ({hotels?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('restaurants')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${
            activeTab === 'restaurants'
              ? 'bg-primary text-white dark:bg-primary-light'
              : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200'
          }`}
        >
          <UtensilsCrossed className="w-4 h-4" />
          Restaurants ({restaurants?.length || 0})
        </button>
      </div>

      {/* Content */}
      {activeTab === 'hotels' && (
        <div>
          <Heading level={3} className="mb-4 text-xl">
            Where to stay in {location}
          </Heading>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {hotels?.map((hotel) => (
              <HotelCard key={hotel.id} hotel={hotel} />
            ))}
          </div>
        </div>
      )}

      {activeTab === 'restaurants' && (
        <div>
          <Heading level={3} className="mb-4 text-xl">
            Where to eat in {location}
          </Heading>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {restaurants?.map((restaurant) => (
              <RestaurantCard key={restaurant.id} restaurant={restaurant} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}