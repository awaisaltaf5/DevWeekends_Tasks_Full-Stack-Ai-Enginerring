import { useState } from 'react'
import { UtensilsCrossed, Coffee, Sun, Moon, Cookie, Salad } from 'lucide-react'

const categories = [
  { id: 'All', label: 'All', icon: UtensilsCrossed },
  { id: 'Breakfast', label: 'Breakfast', icon: Coffee },
  { id: 'Lunch', label: 'Lunch', icon: Sun },
  { id: 'Dinner', label: 'Dinner', icon: Moon },
  { id: 'Dessert', label: 'Dessert', icon: Cookie },
  { id: 'Vegetarian', label: 'Veggie', icon: Salad },
]

export default function CategoryPills({ activeCategory, onCategoryChange }) {
  return (
    <div className="relative">
      <div
        className="flex gap-2 sm:gap-3 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory scroll-px-4 -mx-4 px-4 sm:mx-0 sm:px-0"
        role="tablist"
        aria-label="Recipe categories"
      >
        {categories.map(({ id, label, icon: Icon }) => {
          const isActive = activeCategory === id
          return (
            <button
              key={id}
              onClick={() => onCategoryChange(id)}
              role="tab"
              aria-selected={isActive}
              className={`flex items-center gap-1.5 sm:gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full whitespace-nowrap font-medium text-xs sm:text-sm shrink-0 snap-start transition-all duration-200 active:scale-95 ${
                isActive
                  ? 'bg-primary dark:bg-dark-primary text-white dark:text-dark-background shadow-lg'
                  : 'bg-card dark:bg-dark-card border border-border dark:border-dark-border text-text-secondary dark:text-dark-text-secondary hover:border-primary dark:hover:border-dark-primary hover:text-primary dark:hover:text-dark-primary'
              }`}
            >
              <Icon size={15} className="sm:w-4 sm:h-4 shrink-0" />
              {label}
            </button>
          )
        })}
      </div>

      {/* Edge fade cues so it's visually obvious the row scrolls on mobile */}
      <div className="pointer-events-none absolute top-0 bottom-2 left-0 w-4 bg-gradient-to-r from-background dark:from-dark-background to-transparent sm:hidden" />
      <div className="pointer-events-none absolute top-0 bottom-2 right-0 w-6 bg-gradient-to-l from-background dark:from-dark-background to-transparent sm:hidden" />
    </div>
  )
}