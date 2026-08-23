import { useState, useEffect, useCallback } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import TestimonialCard from '../molecules/TestimonialCard'
import Heading from '../atoms/Heading'

export default function TestimonialCarousel({ testimonials, title, subtitle }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  const totalSlides = testimonials.length
  const slidesPerView = 3 // Desktop: show 3 cards
  const maxIndex = Math.max(0, totalSlides - slidesPerView)

  const goToSlide = useCallback((index) => {
    if (index < 0) index = 0
    if (index > maxIndex) index = maxIndex
    setCurrentIndex(index)
  }, [maxIndex])

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1))
  }, [maxIndex])

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1))
  }, [maxIndex])

  // Auto-play
  useEffect(() => {
    if (!isAutoPlaying) return
    
    const interval = setInterval(() => {
      nextSlide()
    }, 5000) // 5 seconds

    return () => clearInterval(interval)
  }, [isAutoPlaying, nextSlide])

  // Pause auto-play on hover
  const handleMouseEnter = () => setIsAutoPlaying(false)
  const handleMouseLeave = () => setIsAutoPlaying(true)

  return (
    <section 
      className="py-20 bg-white dark:bg-gray-800"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="container-custom">
        {/* Section Header */}
        <div className="text-center mb-16">
          <Heading level={2} className="mb-4">
            {title}
          </Heading>
          {subtitle && (
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              {subtitle}
            </p>
          )}
          <div className="mt-6 flex items-center justify-center gap-2">
            <div className="w-12 h-1 bg-primary dark:bg-primary-light rounded-full" />
            <div className="w-3 h-1 bg-secondary rounded-full" />
            <div className="w-12 h-1 bg-primary dark:bg-primary-light rounded-full" />
          </div>
        </div>

        {/* Carousel Container */}
        <div className="relative">
          {/* Navigation Arrows */}
          <button
            onClick={prevSlide}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-12 h-12 rounded-full bg-white dark:bg-gray-700 shadow-lg flex items-center justify-center text-gray-700 dark:text-gray-200 hover:bg-primary hover:text-white dark:hover:bg-primary-light transition-colors hidden lg:flex"
            aria-label="Previous testimonial"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            onClick={nextSlide}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-12 h-12 rounded-full bg-white dark:bg-gray-700 shadow-lg flex items-center justify-center text-gray-700 dark:text-gray-200 hover:bg-primary hover:text-white dark:hover:bg-primary-light transition-colors hidden lg:flex"
            aria-label="Next testimonial"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Slides Track */}
          <div className="overflow-hidden">
            <div 
              className="flex transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${currentIndex * (100 / slidesPerView)}%)` }}
            >
              {testimonials.map((testimonial) => (
                <div 
                  key={testimonial.id} 
                  className="w-full md:w-1/2 lg:w-1/3 flex-shrink-0 px-4"
                >
                  <TestimonialCard testimonial={testimonial} />
                </div>
              ))}
            </div>
          </div>

          {/* Dots Navigation */}
          <div className="flex items-center justify-center gap-2 mt-8">
            {[...Array(maxIndex + 1)].map((_, i) => (
              <button
                key={i}
                onClick={() => goToSlide(i)}
                className={`transition-all duration-300 rounded-full ${
                  i === currentIndex 
                    ? 'w-8 h-3 bg-primary dark:bg-primary-light' 
                    : 'w-3 h-3 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400'
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}