import { CheckCircle2 } from 'lucide-react'
import { useState } from 'react'

export default function InstructionStep({ step, isLast }) {
  const [completed, setCompleted] = useState(false)

  return (
    <div className="flex gap-4 group">
      {/* Timeline */}
      <div className="flex flex-col items-center">
        <button
          onClick={() => setCompleted(!completed)}
          className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${
            completed
              ? 'bg-success text-white'
              : 'bg-primary/10 dark:bg-dark-primary/10 text-primary dark:text-dark-primary group-hover:bg-primary/20'
          }`}
        >
          {completed ? (
            <CheckCircle2 size={18} />
          ) : (
            <span className="text-sm font-bold">{step.id}</span>
          )}
        </button>
        {!isLast && (
          <div className={`w-0.5 flex-1 mt-2 transition-colors duration-300 ${
            completed ? 'bg-success/30' : 'bg-border dark:bg-dark-border'
          }`} />
        )}
      </div>

      {/* Content */}
      <div className={`pb-6 transition-opacity duration-300 ${completed ? 'opacity-50' : 'opacity-100'}`}>
        <p className={`text-sm leading-relaxed ${
          completed 
            ? 'text-text-secondary dark:text-dark-text-secondary line-through' 
            : 'text-text-primary dark:text-dark-text-primary'
        }`}>
          {step.text}
        </p>
      </div>
    </div>
  )
}