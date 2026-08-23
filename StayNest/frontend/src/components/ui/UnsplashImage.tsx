import { useEffect, useRef, useState } from 'react'
import { Building2 } from 'lucide-react'
import { fetchImage } from '../../services/unsplash'

/**
 * Resilient <img> that never shows a broken-image icon.
 *
 * - Renders the supplied `src` (a DB-stored hotel image, avatar, etc.).
 * - If that image fails to load, it asks the Unsplash API for a currently
 *   valid replacement using `query` (e.g. the hotel name or city) and swaps it
 *   in with real alt text from the API.
 * - If no key / no results / the API itself fails, a neutral placeholder is
 *   rendered instead of a broken-image glyph.
 *
 * Accepts the same props as <img> (className, loading, width, ...).
 */
export default function UnsplashImage({
  src,
  query = 'hotel',
  alt = '',
  className = '',
  ...rest
}) {
  const [current, setCurrent] = useState({ src, alt })
  const [failed, setFailed] = useState(false)
  const attempts = useRef(0)

  // Reset whenever the source/alt changes (e.g. new hotel selected).
  useEffect(() => {
    setCurrent({ src, alt })
    setFailed(false)
    attempts.current = 0
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src])

  const handleError = async () => {
    // Only attempt one API replacement per src to avoid hammering the API.
    attempts.current += 1
    if (attempts.current > 1) {
      setFailed(true)
      return
    }
    try {
      const photo = await fetchImage(query, { perPage: 1 })
      if (photo?.url) {
        setCurrent({ src: photo.url, alt: photo.alt || alt })
      } else {
        setFailed(true)
      }
    } catch {
      setFailed(true)
    }
  }

  if (failed || !current.src) {
    const base =
      'flex items-center justify-center bg-background-alt text-muted/50'
    return (
      <div className={[base, className].filter(Boolean).join(' ')} role="img" aria-label="Image unavailable">
        <Building2 size={26} />
      </div>
    )
  }

  return (
    <img
      src={current.src}
      alt={current.alt || alt}
      onError={handleError}
      className={className}
      {...rest}
    />
  )
}
