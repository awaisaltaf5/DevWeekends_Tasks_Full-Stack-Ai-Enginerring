import { MapPin, Star, Navigation } from 'lucide-react'

export default function HotelCard({ hotel }) {
  const { name, rating, price, image, address, distance } = hotel

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
      </div>
      
      <div className="p-4">
        <h4 className="font-bold text-gray-900 dark:text-white mb-1 truncate">{name}</h4>
        
        <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400 mb-2">
          <MapPin className="w-3.5 h-3.5" />
          <span className="text-xs truncate">{address}</span>
        </div>
        
        <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400 mb-3">
          <Navigation className="w-3.5 h-3.5" />
          <span className="text-xs">{distance} from center</span>
        </div>
        
        <div className="pt-3 border-t border-gray-100 dark:border-gray-700">
          <span className="text-lg font-bold text-primary dark:text-primary-light">${price}</span>
          <span className="text-xs text-gray-400">/night</span>
        </div>
      </div>
    </div>
  )
}