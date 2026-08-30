import React, { useEffect, useState } from 'react';
import { ImageOff } from 'lucide-react';

interface SafeImageProps {
  /** Image URL (Cloudinary secure_url, Unsplash, local path, or empty). */
  src?: string;
  alt: string;
  /** Text fallback (e.g. a doctor's initial) shown when the image is unavailable. */
  fallbackText?: string;
  /** Classes for the wrapper / placeholder box. */
  className?: string;
}

/**
 * Robust hosted-image renderer.
 *
 * - Renders the URL directly (Cloudinary/Unsplash deliverables don't need
 *   browser storage or cookies), so image display never depends on cookies.
 * - `referrerPolicy="no-referrer"` avoids tripping browser tracking-prevention
 *   warnings when the upstream host, e.g. res.cloudinary.com, sets cookies.
 * - Renders a graceful brand-styled placeholder whenever `src` is empty or
 *   the image fails to load.
 */
const SafeImage: React.FC<SafeImageProps> = ({ src, alt, fallbackText, className = '' }) => {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  if (!src || failed) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`flex items-center justify-center overflow-hidden bg-background-alt text-muted ${className}`}
      >
        {fallbackText ? (
          <span className="text-lg font-semibold text-muted">{fallbackText}</span>
        ) : (
          <ImageOff className="h-6 w-6" />
        )}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={className}
    />
  );
};

export default SafeImage;