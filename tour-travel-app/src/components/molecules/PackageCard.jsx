import { MapPin, Clock, Users, Check, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Badge from '../atoms/Badge'
import RatingStars from '../atoms/RatingStars'
import Button from '../atoms/Button'

export default function PackageCard({ package: pkg }) {
  const { 
    title, 
    image, 
    duration, 
    locations, 
    price, 
    originalPrice, 
    rating, 
    reviews, 
    badge, 
    highlights, 
    groupSize 
  } = pkg

  const navigate = useNavigate()
  const discount = Math.round(((originalPrice - price) / originalPrice) * 100)

  const handleBookNow = () => {
    // Navigate to search results with first location
    const searchLocation = locations[0] || title
    navigate(`/search?q=${encodeURIComponent(searchLocation)}`)
  }

  return (
    <div className="group bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100 dark:border-gray-700 flex flex-col">
      {/* Image */}
      <div className="relative overflow-hidden aspect-[16/10] bg-gray-200 dark:bg-gray-700">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600&h=400&fit=crop&q=80'
          }}
        />
        {badge && (
          <div className="absolute top-4 right-4">
            <Badge text={badge} />
          </div>
        )}
        {discount > 0 && (
          <div className="absolute top-4 left-4 bg-secondary text-white text-xs font-bold px-3 py-1.5 rounded-full">
            Save {discount}%
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6 flex-1 flex flex-col">
        {/* Title */}
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-primary dark:group-hover:text-primary-light transition-colors">
          {title}
        </h3>

        {/* Rating */}
        <div className="mb-3">
          <RatingStars rating={rating} reviews={reviews} />
        </div>

        {/* Meta Info */}
        <div className="flex flex-wrap gap-3 mb-4 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4 text-primary dark:text-primary-light" />
            <span>{duration}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4 text-primary dark:text-primary-light" />
            <span>{groupSize}</span>
          </div>
        </div>

        {/* Locations */}
        <div className="flex items-start gap-1.5 mb-4">
          <MapPin className="w-4 h-4 text-primary dark:text-primary-light mt-0.5 flex-shrink-0" />
          <div className="flex flex-wrap gap-1">
            {locations.map((loc, i) => (
              <span key={loc} className="text-sm text-gray-600 dark:text-gray-300">
                {loc}{i < locations.length - 1 ? ',' : ''}
              </span>
            ))}
          </div>
        </div>

        {/* Highlights */}
        <div className="mb-6 flex-1">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Highlights</p>
          <ul className="space-y-1.5">
            {highlights.map((highlight) => (
              <li key={highlight} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                <Check className="w-3.5 h-3.5 text-primary dark:text-primary-light flex-shrink-0" />
                {highlight}
              </li>
            ))}
          </ul>
        </div>

        {/* Price & CTA */}
        <div className="pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-primary dark:text-primary-light">
                ${price.toLocaleString()}
              </span>
              <span className="text-sm text-gray-400 line-through">
                ${originalPrice.toLocaleString()}
              </span>
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400">per person</span>
          </div>
          <Button variant="primary" size="small" onClick={handleBookNow}>
            Book Now
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}