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
    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
      {categories.map(({ id, label, icon: Icon }) => {
        const isActive = activeCategory === id
        return (
          <button
            key={id}
            onClick={() => onCategoryChange(id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full whitespace-nowrap font-medium text-sm transition-all duration-200 ${
              isActive
                ? 'bg-primary dark:bg-dark-primary text-white dark:text-dark-background shadow-lg'
                : 'bg-card dark:bg-dark-card border border-border dark:border-dark-border text-text-secondary dark:text-dark-text-secondary hover:border-primary dark:hover:border-dark-primary hover:text-primary dark:hover:text-dark-primary'
            }`}
          >
            <Icon size={16} />
            {label}
          </button>
        )
      })}
    </div>
  )
}