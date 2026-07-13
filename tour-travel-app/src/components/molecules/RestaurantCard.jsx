import { MapPin, Star, UtensilsCrossed, Navigation } from 'lucide-react'

export default function RestaurantCard({ restaurant }) {
  const { name, cuisine, rating, priceLevel, image, address, distance } = restaurant

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100 dark:border-gray-700">
      <div className="relative overflow-hidden aspect-[4/3]">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute top-3 right-3 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm px-2 py-1 rounded-lg">
          <div className="flex items-center gap-1">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span className="text-xs font-bold text-gray-900 dark:text-white">{rating}</span>
          </div>
        </div>
        <div className="absolute top-3 left-3 bg-primary/90 dark:bg-primary-light/90 backdrop-blur-sm px-2 py-1 rounded-lg">
          <span className="text-xs font-bold text-white">{priceLevel}</span>
        </div>
      </div>
      
      <div className="p-4">
        <h4 className="font-bold text-gray-900 dark:text-white mb-1 truncate">{name}</h4>
        
        <div className="flex items-center gap-1 text-primary dark:text-primary-light mb-2">
          <UtensilsCrossed className="w-3.5 h-3.5" />
          <span className="text-xs font-medium">{cuisine}</span>
        </div>
        
        <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400 mb-1">
          <MapPin className="w-3.5 h-3.5" />
          <span className="text-xs truncate">{address}</span>
        </div>
        
        <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
          <Navigation className="w-3.5 h-3.5" />
          <span className="text-xs">{distance} from center</span>
        </div>
      </div>
    </div>
  )
}