import { MapPin, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Badge from '../atoms/Badge'
import RatingStars from '../atoms/RatingStars'
import Button from '../atoms/Button'

export default function DestinationCard({ destination }) {
  const { name, country, image, price, rating, reviews, badge, badgeColor } = destination
  const navigate = useNavigate()

  const handleExplore = () => {
    // Navigate to search results with this destination
    navigate(`/search?q=${encodeURIComponent(name)}`)
  }

  return (
    <div className="group bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100 dark:border-gray-700">
      {/* Image Container */}
      <div className="relative overflow-hidden aspect-[4/3] bg-gray-200 dark:bg-gray-700">
        <img
          src={image}
          alt={`${name}, ${country}`}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600&h=400&fit=crop&q=80'
          }}
        />
        {/* Badge */}
        {badge && (
          <div className="absolute top-4 right-4">
            <Badge text={badge} variant={badgeColor} />
          </div>
        )}
        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Location */}
        <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 mb-2">
          <MapPin className="w-4 h-4 text-primary dark:text-primary-light" />
          <span className="text-sm font-medium">{country}</span>
        </div>

        {/* Name */}
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-primary dark:group-hover:text-primary-light transition-colors">
          {name}
        </h3>

        {/* Rating */}
        <div className="mb-4">
          <RatingStars rating={rating} reviews={reviews} />
        </div>

        {/* Price & CTA */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
          <div>
            <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-medium">From</span>
            <p className="text-2xl font-bold text-primary dark:text-primary-light">
              ${price.toLocaleString()}
            </p>
          </div>
          <Button variant="outline" size="small" onClick={handleExplore}>
            Explore
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}