import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, SlidersHorizontal, Check, Leaf, Flame, Wheat, Droplets, Dumbbell, Salad, Heart, Egg, Candy, Scale, Wind } from 'lucide-react'
import { DIET_FILTERS, HEALTH_FILTERS, CALORIE_RANGES } from '../../services/edamam'

const healthIcons = {
  'vegan': Leaf,
  'vegetarian': Salad,
  'keto-friendly': Flame,
  'gluten-free': Wheat,
  'dairy-free': Droplets,
  'peanut-free': X,
  'sugar-conscious': Candy,
  'egg-free': Egg,
}

const dietIcons = {
  'balanced': Scale,
  'high-protein': Dumbbell,
  'low-carb': Wind,
  'low-fat': Heart,
}

export default function FilterModal({ isOpen, onClose, onApply, currentFilters = {} }) {
  const [selectedDiet, setSelectedDiet] = useState(currentFilters.diet || '')
  const [selectedHealth, setSelectedHealth] = useState(
    currentFilters.health ? currentFilters.health.split(',') : []
  )
  const [selectedCalories, setSelectedCalories] = useState(currentFilters.calories || '')

  // Lock body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => { document.body.style.overflow = 'unset' }
  }, [isOpen])

  const toggleHealth = (healthId) => {
    setSelectedHealth(prev => 
      prev.includes(healthId) 
        ? prev.filter(h => h !== healthId)
        : [...prev, healthId]
    )
  }

  const handleApply = () => {
    onApply({
      diet: selectedDiet,
      health: selectedHealth.length > 0 ? selectedHealth.join(',') : '',
      calories: selectedCalories,
    })
    onClose()
  }

  const handleReset = () => {
    setSelectedDiet('')
    setSelectedHealth([])
    setSelectedCalories('')
  }

  const hasFilters = selectedDiet || selectedHealth.length > 0 || selectedCalories

  const activeCount = [
    selectedDiet ? 1 : 0,
    selectedHealth.length,
    selectedCalories ? 1 : 0
  ].reduce((a, b) => a + b, 0)

  const getButtonClass = (isSelected) => {
    const base = 'flex items-center justify-center gap-2 px-3 py-2.5 md:py-3 rounded-xl text-xs md:text-sm font-medium transition-all duration-200 w-full '
    
    if (isSelected) {
      return base + 'bg-primary dark:bg-dark-primary text-white dark:text-[#1A1A2E] shadow-md border-2 border-primary dark:border-dark-primary'
    }
    
    return base + 'bg-background dark:bg-dark-background/80 border-2 border-border dark:border-dark-border/60 text-text-secondary dark:text-dark-text-secondary hover:border-primary/50 dark:hover:border-dark-primary/50'
  }

  const getHealthButtonClass = (isSelected) => {
    const base = 'flex items-center gap-2 px-3 py-2.5 md:py-3 rounded-xl text-xs md:text-sm font-medium transition-all duration-200 w-full '
    
    if (isSelected) {
      return base + 'bg-primary dark:bg-dark-primary text-white dark:text-[#1A1A2E] shadow-md border-2 border-primary dark:border-dark-primary'
    }
    
    return base + 'bg-background dark:bg-dark-background/80 border-2 border-border dark:border-dark-border/60 text-text-secondary dark:text-dark-text-secondary hover:border-primary/50 dark:hover:border-dark-primary/50'
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />
          
          {/* Bottom Sheet Container */}
          {/* NOTICE: added mb-16 (or mb-[68px]) for mobile screen so it sits perfectly above the nav tab bar, and md:mb-0 to reset on large layouts */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-x-0 bottom-0 mb-[64px] md:mb-0 z-50 bg-card dark:bg-dark-card rounded-t-[28px] md:rounded-t-3xl md:max-w-lg md:mx-auto md:left-1/2 md:-translate-x-1/2 md:w-full shadow-2xl flex flex-col max-h-[75vh] md:max-h-[90vh]"
          >
            {/* Drag Handle */}
            <div className="flex justify-center pt-2.5 pb-1 shrink-0">
              <div className="w-10 h-1 rounded-full bg-border dark:bg-dark-border" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-4 md:px-5 py-3 border-b border-border dark:border-dark-border shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-primary/10 dark:bg-dark-primary/10 flex items-center justify-center shrink-0">
                  <SlidersHorizontal size={18} className="text-primary dark:text-dark-primary" />
                </div>
                <div>
                  <h3 className="text-base md:text-lg font-bold text-text-primary dark:text-dark-text-primary leading-tight">Filters</h3>
                  <p className="text-[10px] md:text-xs text-text-secondary dark:text-dark-text-secondary mt-0.5">Powered by Edamam</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {hasFilters && (
                  <button
                    onClick={handleReset}
                    className="px-2.5 py-1.5 rounded-lg text-xs md:text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    Reset
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="w-8 h-8 md:w-9 md:h-9 rounded-xl bg-border dark:bg-dark-border flex items-center justify-center text-text-secondary dark:text-dark-text-secondary hover:text-text-primary dark:hover:text-dark-text-primary transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 min-h-0 overflow-y-auto px-4 md:px-5 py-4 space-y-5 md:space-y-6">
              
              {/* Diet Type */}
              <section>
                <h4 className="text-[10px] md:text-xs font-bold text-text-secondary dark:text-dark-text-secondary mb-2.5 md:mb-3 uppercase tracking-wider">
                  Diet Type
                </h4>
                <div className="grid grid-cols-2 gap-2 md:gap-3">
                  {DIET_FILTERS.map((diet) => {
                    const Icon = dietIcons[diet.id] || Scale
                    const isSelected = selectedDiet === diet.id
                    return (
                      <button
                        key={diet.id}
                        onClick={() => setSelectedDiet(isSelected ? '' : diet.id)}
                        className={getButtonClass(isSelected)}
                      >
                        <Icon size={15} className={isSelected ? 'text-white dark:text-[#1A1A2E]' : 'text-text-secondary dark:text-dark-text-secondary'} />
                        <span className="truncate">{diet.label}</span>
                      </button>
                    )
                  })}
                </div>
              </section>

              {/* Health Labels */}
              <section>
                <h4 className="text-[10px] md:text-xs font-bold text-text-secondary dark:text-dark-text-secondary mb-2.5 md:mb-3 uppercase tracking-wider">
                  Health Labels
                </h4>
                <div className="grid grid-cols-2 gap-2 md:gap-3">
                  {HEALTH_FILTERS.map((health) => {
                    const Icon = healthIcons[health.id] || Leaf
                    const isSelected = selectedHealth.includes(health.id)
                    return (
                      <button
                        key={health.id}
                        onClick={() => toggleHealth(health.id)}
                        className={getHealthButtonClass(isSelected)}
                      >
                        <Icon size={14} className={isSelected ? 'text-white dark:text-[#1A1A2E]' : 'text-text-secondary dark:text-dark-text-secondary shrink-0'} />
                        <span className="flex-1 text-left truncate">{health.label}</span>
                        {isSelected && <Check size={14} className="shrink-0" />}
                      </button>
                    )
                  })}
                </div>
              </section>

              {/* Calorie Range */}
              <section>
                <h4 className="text-[10px] md:text-xs font-bold text-text-secondary dark:text-dark-text-secondary mb-2.5 md:mb-3 uppercase tracking-wider">
                  Calories per Serving
                </h4>
                <div className="flex flex-wrap gap-2 md:gap-3">
                  {CALORIE_RANGES.map((range) => {
                    const isSelected = selectedCalories === range.id
                    return (
                      <button
                        key={range.id}
                        onClick={() => setSelectedCalories(isSelected ? '' : range.id)}
                        className={getButtonClass(isSelected)}
                      >
                        {range.label}
                      </button>
                    )
                  })}
                </div>
              </section>
            </div>

            {/* Apply Button */}
            <div className="shrink-0 px-4 md:px-5 py-3 md:py-4 bg-card dark:bg-dark-card border-t border-border dark:border-dark-border">
              <button
                onClick={handleApply}
                className="w-full flex items-center justify-center gap-2 py-3 md:py-3.5 rounded-2xl bg-primary dark:bg-dark-primary text-white dark:text-[#1A1A2E] font-bold text-sm md:text-base shadow-lg hover:shadow-xl active:scale-[0.98] transition-all"
              >
                <SlidersHorizontal size={16} />
                <span>Apply Filters</span>
                {activeCount > 0 && (
                  <span className="ml-1 px-2 py-0.5 rounded-full bg-white/20 text-xs font-bold">
                    {activeCount}
                  </span>
                )}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}