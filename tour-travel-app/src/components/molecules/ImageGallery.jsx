import { useState } from 'react'
import { Camera, ChevronLeft, ChevronRight } from 'lucide-react'

export default function ImageGallery({ images, query }) {
  const [selectedImage, setSelectedImage] = useState(0)

  if (!images || images.length === 0) {
    return (
      <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl p-8 text-center">
        <Camera className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-500 dark:text-gray-400">No images found for {query}</p>
      </div>
    )
  }

  const currentImage = images[selectedImage]

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md border border-gray-100 dark:border-gray-700">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <Camera className="w-5 h-5 text-primary dark:text-primary-light" />
        Photos of {query}
      </h3>

      {/* Main Image */}
      <div className="relative rounded-xl overflow-hidden aspect-video bg-gray-100 dark:bg-gray-700 mb-4">
        <img
          src={currentImage.url}
          alt={currentImage.alt}
          className="w-full h-full object-cover"
        />
        
        {/* Navigation */}
        {images.length > 1 && (
          <>
            <button
              onClick={() => setSelectedImage((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => setSelectedImage((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Image Counter */}
        <div className="absolute bottom-3 right-3 bg-black/50 text-white text-xs px-3 py-1 rounded-full">
          {selectedImage + 1} / {images.length}
        </div>
      </div>

      {/* Thumbnails */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {images.map((img, i) => (
          <button
            key={img.id}
            onClick={() => setSelectedImage(i)}
            className={`flex-shrink-0 w-20 h-14 rounded-lg overflow-hidden border-2 transition-colors ${
              i === selectedImage 
                ? 'border-primary dark:border-primary-light' 
                : 'border-transparent hover:border-gray-300'
            }`}
          >
            <img src={img.thumb} alt={img.alt} className="w-full h-full object-cover" />
          </button>
        ))}
      </div>
    </div>
  )
}