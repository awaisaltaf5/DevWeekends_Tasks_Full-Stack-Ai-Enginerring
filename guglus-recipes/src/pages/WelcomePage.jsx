import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, useReducedMotion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'framer-motion'
import { ChefHat, ArrowRight, Sparkles, Utensils, Soup, Croissant, Salad } from 'lucide-react'

// ─── Constants ───────────────────────────────────────────────────────────────
const BG_IMAGE_URL = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836'
const STORAGE_KEY = 'guglu-visited'
const REDIRECT_PATH = '/home'
const SPINNER_DELAY_MS = 100

// Responsive image sizes for srcset
const IMAGE_SIZES = [400, 800, 1200, 1600]
const SRCSET = IMAGE_SIZES.map(w => `${BG_IMAGE_URL}?w=${w}&q=80&auto=format ${w}w`).join(', ')

// Decorative floating food icons — tie the motion to the subject (cooking)
// instead of generic shapes. Positions are spread in viewport-relative units
// so they hold their composition at every breakpoint.
const FLOATING_ICONS = [
  { Icon: Utensils, top: '14%', left: '10%', size: 22, duration: 7, delay: 0 },
  { Icon: Soup, top: '72%', left: '14%', size: 26, duration: 9, delay: 0.6 },
  { Icon: Croissant, top: '20%', left: '86%', size: 24, duration: 8, delay: 1.1 },
  { Icon: Salad, top: '78%', left: '84%', size: 22, duration: 10, delay: 0.3 },
]

// ─── Animation variants ──────────────────────────────────────────────────────
const containerVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.14, delayChildren: 0.15 },
  },
}

const riseIn = {
  hidden: { opacity: 0, y: 24, filter: 'blur(6px)' },
  show: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
  },
}

// ─── Component ───────────────────────────────────────────────────────────────
export default function WelcomePage() {
  const navigate = useNavigate()
  const prefersReducedMotion = useReducedMotion()

  const [ready, setReady] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)
  const timerRef = useRef(null)

  // Subtle cursor-driven parallax (desktop only, respects reduced motion)
  const mvX = useMotionValue(0)
  const mvY = useMotionValue(0)
  const springX = useSpring(mvX, { stiffness: 60, damping: 20, mass: 0.6 })
  const springY = useSpring(mvY, { stiffness: 60, damping: 20, mass: 0.6 })
  const bgShiftX = useTransform(springX, [-1, 1], ['-2%', '2%'])
  const bgShiftY = useTransform(springY, [-1, 1], ['-2%', '2%'])
  const orbShiftX = useTransform(springX, [-1, 1], ['-3.5%', '3.5%'])
  const orbShiftY = useTransform(springY, [-1, 1], ['-3.5%', '3.5%'])

  const handlePointerMove = useCallback((e) => {
    if (prefersReducedMotion) return
    const { innerWidth, innerHeight } = window
    mvX.set((e.clientX / innerWidth) * 2 - 1)
    mvY.set((e.clientY / innerHeight) * 2 - 1)
  }, [mvX, mvY, prefersReducedMotion])

  // Cleanup timer on unmount
  useEffect(() => {
    timerRef.current = setTimeout(() => setReady(true), SPINNER_DELAY_MS)
    return () => clearTimeout(timerRef.current)
  }, [])

  // Memoized navigation handler
  const handleStart = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEY, 'true')
      navigate(REDIRECT_PATH, { replace: true })
    } catch (e) {
      // Fallback if localStorage is blocked (private mode, etc.)
      navigate(REDIRECT_PATH, { replace: true })
    }
  }, [navigate])

  const rings = useMemo(() => [...Array(5)], [])

  // ─── Loading State ─────────────────────────────────────────────────────────
  return (
    <AnimatePresence mode="wait">
      {!ready ? (
        <motion.div
          key="loader"
          exit={{ opacity: 0, transition: { duration: 0.35 } }}
          className="min-h-[100dvh] flex flex-col items-center justify-center gap-3 bg-[#FEFAE0] dark:bg-[#1A1A2E]"
          role="status"
        >
          <motion.div
            animate={prefersReducedMotion ? {} : { rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
            className="will-change-transform"
          >
            <ChefHat
              size={36}
              className="text-primary dark:text-dark-primary"
              aria-hidden="true"
            />
          </motion.div>
          <motion.div
            className="flex gap-1.5"
            aria-hidden="true"
            initial="hidden"
            animate={prefersReducedMotion ? 'hidden' : 'show'}
            variants={{ show: { transition: { staggerChildren: 0.15, repeat: Infinity } } }}
          >
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-primary/60 dark:bg-dark-primary/60"
                variants={{
                  hidden: { y: 0, opacity: 0.4 },
                  show: { y: [-4, 0], opacity: [1, 0.4], transition: { duration: 0.6, repeat: Infinity } },
                }}
              />
            ))}
          </motion.div>
          <span className="sr-only">Loading Guglu's Recipes...</span>
        </motion.div>
      ) : (
        // ─── Main Render ───────────────────────────────────────────────────────
        <motion.div
          key="content"
          onPointerMove={handlePointerMove}
          className="relative min-h-[100dvh] flex items-center justify-center overflow-hidden bg-[#FEFAE0] dark:bg-[#1A1A2E]"
        >
          {/* ── Background Image with slow parallax drift ── */}
          <motion.div
            className="absolute inset-0 z-0"
            style={prefersReducedMotion ? {} : { x: bgShiftX, y: bgShiftY, scale: 1.06 }}
          >
            {!imageError ? (
              <motion.img
                src={`${BG_IMAGE_URL}?w=1200&q=80&auto=format`}
                srcSet={SRCSET}
                sizes="100vw"
                alt=""
                loading="eager"
                decoding="async"
                fetchPriority="high"
                initial={{ scale: 1.15, opacity: 0 }}
                animate={{
                  scale: 1,
                  opacity: imageLoaded ? 1 : 0,
                }}
                transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
                className="w-full h-full object-cover"
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageError(true)}
              />
            ) : (
              // Animated fallback gradient if image fails
              <motion.div
                className="w-full h-full bg-[linear-gradient(120deg,#FDE7B0,#FBEAD1,#F6D9A8)] dark:bg-[linear-gradient(120deg,#1A1A2E,#232342,#1A1A2E)] bg-[length:200%_200%]"
                animate={prefersReducedMotion ? {} : { backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
                transition={{ duration: 14, repeat: Infinity, ease: 'linear' }}
              />
            )}

            {/* Overlay layers */}
            <div className="absolute inset-0 bg-[#FEFAE0]/85 dark:bg-[#1A1A2E]/88" />
            <div className="absolute inset-0 bg-gradient-to-b from-[#FEFAE0]/60 dark:from-[#1A1A2E]/60 via-transparent to-[#FEFAE0]/95 dark:to-[#1A1A2E]/95" />
          </motion.div>

          {/* ── Ambient gradient orbs (replaces flat circles with soft glow + drift) ── */}
          <motion.div
            className="absolute inset-0 overflow-hidden pointer-events-none z-[1]"
            style={prefersReducedMotion ? {} : { x: orbShiftX, y: orbShiftY }}
            aria-hidden="true"
          >
            <motion.div
              className="absolute w-[26rem] h-[26rem] -top-24 -left-24 rounded-full bg-primary/20 dark:bg-dark-primary/15 blur-3xl will-change-transform"
              animate={prefersReducedMotion ? {} : { scale: [1, 1.15, 1], opacity: [0.5, 0.8, 0.5] }}
              transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
              className="absolute w-[22rem] h-[22rem] -bottom-20 -right-16 rounded-full bg-amber-300/25 dark:bg-[#D4A96A]/15 blur-3xl will-change-transform"
              animate={prefersReducedMotion ? {} : { scale: [1, 1.2, 1], opacity: [0.4, 0.7, 0.4] }}
              transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            />
          </motion.div>

          {/* ── Floating Rings (Decorative) ── */}
          <div
            className="absolute inset-0 overflow-hidden pointer-events-none z-[1]"
            aria-hidden="true"
          >
            {rings.map((_, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full border border-primary/10 dark:border-dark-primary/10 will-change-transform"
                style={{
                  width: `${6.25 + i * 5}rem`,
                  height: `${6.25 + i * 5}rem`,
                  left: '50%',
                  top: '50%',
                  marginLeft: `-${3.125 + i * 2.5}rem`,
                  marginTop: `-${3.125 + i * 2.5}rem`,
                }}
                animate={prefersReducedMotion ? {} : { rotate: i % 2 === 0 ? 360 : -360 }}
                transition={{
                  duration: 20 + i * 10,
                  repeat: Infinity,
                  ease: 'linear',
                }}
              />
            ))}
          </div>

          {/* ── Floating food icons (subject-appropriate ambient motion) ── */}
          <div className="absolute inset-0 pointer-events-none z-[1] hidden sm:block" aria-hidden="true">
            {FLOATING_ICONS.map(({ Icon, top, left, size, duration, delay }, i) => (
              <motion.div
                key={i}
                className="absolute text-primary/25 dark:text-dark-primary/20"
                style={{ top, left }}
                animate={prefersReducedMotion ? {} : {
                  y: [0, -14, 0],
                  rotate: [0, i % 2 === 0 ? 8 : -8, 0],
                }}
                transition={{ duration, repeat: Infinity, ease: 'easeInOut', delay }}
              >
                <Icon size={size} />
              </motion.div>
            ))}
          </div>

          {/* ── Content ── */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="relative z-10 text-center px-4 sm:px-6 max-w-md w-full mx-auto py-safe"
          >

            {/* Logo */}
            <motion.div
              variants={riseIn}
              initial={prefersReducedMotion ? {} : { scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', duration: 0.8, bounce: 0.45 }}
              className="mb-6 sm:mb-8"
            >
              <div className="relative inline-block group">
                {/* Soft pulsing halo behind the badge */}
                <motion.div
                  className="absolute inset-0 rounded-2xl sm:rounded-3xl bg-primary/40 dark:bg-dark-primary/30 blur-xl"
                  animate={prefersReducedMotion ? {} : { scale: [1, 1.25, 1], opacity: [0.5, 0.9, 0.5] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  aria-hidden="true"
                />
                <motion.div
                  whileHover={prefersReducedMotion ? {} : { rotate: [0, -6, 6, -3, 0] }}
                  transition={{ duration: 0.6 }}
                  className="relative w-20 h-20 sm:w-24 md:w-28 sm:h-24 md:h-28 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-primary to-primary-hover dark:from-dark-primary dark:to-[#D4A96A] flex items-center justify-center shadow-2xl mx-auto ring-1 ring-white/20"
                >
                  <motion.div
                    animate={prefersReducedMotion ? {} : { rotate: [0, -8, 8, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <ChefHat
                      size={40}
                      className="text-white dark:text-[#1A1A2E] sm:w-12 sm:h-12 md:w-14 md:h-14"
                      aria-hidden="true"
                    />
                  </motion.div>
                </motion.div>
                <motion.div
                  className="absolute -top-1 -right-1 w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 bg-success rounded-full flex items-center justify-center shadow-lg"
                  animate={prefersReducedMotion ? {} : { scale: [1, 1.2, 1], rotate: [0, 15, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Sparkles
                    size={14}
                    className="text-white sm:w-4 sm:h-4"
                    aria-hidden="true"
                  />
                </motion.div>
              </div>
            </motion.div>

            {/* Title */}
            <h1 className="mb-2 leading-tight">
              <motion.span
                variants={riseIn}
                className="block text-4xl sm:text-5xl md:text-[3.5rem] font-black text-text-primary dark:text-dark-text-primary tracking-tight"
              >
                Guglu's
              </motion.span>
              <motion.span
                variants={riseIn}
                className="block text-xl sm:text-2xl md:text-[1.75rem] font-bold bg-gradient-to-r from-primary to-primary-hover dark:from-dark-primary dark:to-[#D4A96A] bg-clip-text text-transparent"
              >
                Recipes
              </motion.span>
            </h1>

            {/* Tagline */}
            <motion.p
              variants={riseIn}
              className="text-text-secondary dark:text-dark-text-secondary mt-3 sm:mt-4 mb-8 sm:mb-10 text-base sm:text-lg px-2"
            >
              Discover flavors from around the world
            </motion.p>

            {/* CTA Button */}
            <motion.button
              variants={riseIn}
              whileHover={prefersReducedMotion ? {} : { scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleStart}
              className="relative inline-flex items-center gap-2 sm:gap-3 px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl bg-primary dark:bg-dark-primary hover:bg-primary-hover dark:hover:bg-[#D4A96A] text-white dark:text-[#1A1A2E] font-bold text-base sm:text-lg shadow-xl transition-colors focus:outline-none focus:ring-4 focus:ring-primary/30 dark:focus:ring-dark-primary/30 min-h-[48px] touch-manipulation overflow-hidden isolate"
              aria-label="Start cooking and explore recipes"
            >
              {/* Sheen sweep on hover */}
              {!prefersReducedMotion && (
                <motion.span
                  className="absolute inset-0 -z-10 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                  initial={{ x: '-120%' }}
                  whileHover={{ x: '120%' }}
                  transition={{ duration: 0.8, ease: 'easeInOut' }}
                  aria-hidden="true"
                />
              )}
              <span className="relative">Start Cooking</span>
              <motion.span
                className="relative"
                animate={prefersReducedMotion ? {} : { x: [0, 5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                aria-hidden="true"
              >
                <ArrowRight size={18} className="sm:w-5 sm:h-5" />
              </motion.span>
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}