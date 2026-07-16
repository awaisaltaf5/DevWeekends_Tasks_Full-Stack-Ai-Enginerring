import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ChefHat, ArrowRight, Sparkles } from 'lucide-react'

export default function WelcomePage() {
  const navigate = useNavigate()
  const [ready, setReady] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)

  useEffect(() => {
    setTimeout(() => setReady(true), 100)
  }, [])

  const handleStart = () => {
    localStorage.setItem('guglu-visited', 'true')
    navigate('/home', { replace: true })
  }

  // Food background image
  const bgImage = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&q=80'

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FEFAE0] dark:bg-[#1A1A2E]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
        >
          <ChefHat size={36} className="text-primary dark:text-dark-primary" />
        </motion.div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#FEFAE0] dark:bg-[#1A1A2E]">
      
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src={bgImage}
          alt="Food background"
          className={`w-full h-full object-cover transition-opacity duration-1000 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setImageLoaded(true)}
        />
        <div className="absolute inset-0 bg-[#FEFAE0]/85 dark:bg-[#1A1A2E]/88" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#FEFAE0]/60 dark:from-[#1A1A2E]/60 via-transparent to-[#FEFAE0]/95 dark:to-[#1A1A2E]/95" />
      </div>

      {/* Floating Circles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-[1]">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full border border-primary/10 dark:border-dark-primary/10"
            style={{
              width: 100 + i * 80,
              height: 100 + i * 80,
              left: '50%',
              top: '50%',
              marginLeft: -(50 + i * 40),
              marginTop: -(50 + i * 40),
            }}
            animate={{ rotate: 360 }}
            transition={{
              duration: 20 + i * 10,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-md">
        
        {/* Logo */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', duration: 0.8 }}
          className="mb-8"
        >
          <div className="relative inline-block">
            <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-primary to-primary-hover dark:from-dark-primary dark:to-[#D4A96A] flex items-center justify-center shadow-2xl mx-auto">
              <ChefHat size={56} className="text-white dark:text-[#1A1A2E]" />
            </div>
            <motion.div
              className="absolute -top-1 -right-1 w-8 h-8 bg-success rounded-full flex items-center justify-center shadow-lg"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Sparkles size={16} className="text-white" />
            </motion.div>
          </div>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-5xl font-black text-text-primary dark:text-dark-text-primary mb-2"
        >
          Guglu's
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <span className="text-2xl font-bold text-primary dark:text-dark-primary">Recipes</span>
        </motion.div>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-text-secondary dark:text-dark-text-secondary mt-4 mb-10 text-lg"
        >
          Discover flavors from around the world
        </motion.p>

        {/* CTA Button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleStart}
          className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-primary dark:bg-dark-primary hover:bg-primary-hover dark:hover:bg-[#D4A96A] text-white dark:text-[#1A1A2E] font-bold text-lg shadow-xl transition-colors"
        >
          Start Cooking
          <motion.span
            animate={{ x: [0, 5, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <ArrowRight size={20} />
          </motion.span>
        </motion.button>
      </div>
    </div>
  )
}