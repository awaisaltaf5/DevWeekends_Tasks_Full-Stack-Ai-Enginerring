import { MapPin, Quote } from 'lucide-react'
import RatingStars from '../atoms/RatingStars'

export default function TestimonialCard({ testimonial }) {
  const { name, avatar, location, rating, text, trip, date } = testimonial

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-md border border-gray-100 dark:border-gray-700 h-full flex flex-col">
      {/* Quote Icon */}
      <div className="mb-4">
        <Quote className="w-10 h-10 text-primary/20 dark:text-primary-light/20" />
      </div>

      {/* Review Text */}
      <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6 flex-1 text-base">
        "{text}"
      </p>

      {/* Rating */}
      <div className="mb-6">
        <RatingStars rating={rating} showCount={false} />
      </div>

      {/* Author Info */}
      <div className="flex items-center gap-4 pt-6 border-t border-gray-100 dark:border-gray-700">
        <img
          src={avatar}
          alt={name}
          className="w-14 h-14 rounded-full object-cover border-2 border-primary/20 dark:border-primary-light/20"
          loading="lazy"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&q=80'
          }}
        />
        <div className="flex-1">
          <h4 className="font-bold text-gray-900 dark:text-white">{name}</h4>
          <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
            <MapPin className="w-3.5 h-3.5" />
            <span>{location}</span>
          </div>
        </div>
      </div>

      {/* Trip Info */}
      <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between text-sm">
          <span className="text-primary dark:text-primary-light font-medium">{trip}</span>
          <span className="text-gray-400">{date}</span>
        </div>
      </div>
    </div>
  )
}