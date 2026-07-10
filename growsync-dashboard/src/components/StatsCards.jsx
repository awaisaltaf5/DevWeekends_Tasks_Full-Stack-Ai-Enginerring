import React from 'react'
import { Icons } from './Icons'

function StatsCards({ stats }) {
  const cards = [
    { key: 'total', label: 'Total', value: stats.total, class: 'total' },
    { key: 'ended', label: 'Ended', value: stats.ended, class: 'ended' },
    { key: 'running', label: 'Running', value: stats.running, class: 'running' },
    { key: 'pending', label: 'Pending', value: stats.pending, class: 'pending', subtitle: 'On Discuss' },
  ]

  return (
    <div className="stats-grid">
      {cards.map(card => (
        <div key={card.key} className={`stat-card ${card.class}`}>
          <div className="stat-card-header">
            <span>{card.label}</span>
            <button className="arrow-btn">
              <Icons.arrowUpRight />
            </button>
          </div>
          <div className="stat-value">{card.value}</div>
          {card.subtitle && <div className="stat-subtitle">{card.subtitle}</div>}
        </div>
      ))}
    </div>
  )
}

export default StatsCards
