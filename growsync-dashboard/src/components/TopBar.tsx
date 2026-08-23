import React from 'react'
import { Icons } from './Icons'

function TopBar({ user, onSearch }) {
  return (
    <div className="top-bar">
      <div className="search-box">
        <Icons.search />
        <input 
          type="text" 
          placeholder="Search Task" 
          onChange={e => onSearch(e.target.value)}
        />
        <span className="search-shortcut">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M4 7V4h3M4 17v3h3M20 7V4h-3M20 17v3h-3M9 9h6v6H9z"/>
          </svg>
          F
        </span>
      </div>
      <div className="top-actions">
        <button className="icon-btn">
          <Icons.mail />
        </button>
        <button className="icon-btn">
          <Icons.bell />
          <span className="notification-dot"></span>
        </button>
        <img 
          src={user.avatar} 
          alt={user.name} 
          className="top-avatar" 
        />
      </div>
    </div>
  )
}

export default TopBar
