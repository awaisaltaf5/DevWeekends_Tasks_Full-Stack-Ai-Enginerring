import { useState } from 'react'

// SVG Icons as functional components (no external dependencies)
const Icons = {
  logo: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M12 2L2 7l10 5 10-5-10-5z"/>
      <path d="M2 17l10 5 10-5"/>
      <path d="M2 12l10 5 10-5"/>
    </svg>
  ),
  todo: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 11l3 3L22 4"/>
      <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
    </svg>
  ),
  impact: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
    </svg>
  ),
  analytics: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 3v18h18"/>
      <path d="M18 17V9"/>
      <path d="M13 17V5"/>
      <path d="M8 17v-3"/>
    </svg>
  ),
  leaderboard: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6 9H4.5a2.5 2.5 0 01-2.5-2.5v0A2.5 2.5 0 014.5 4h3"/>
      <path d="M18 9h1.5a2.5 2.5 0 002.5-2.5v0A2.5 2.5 0 0019.5 4h-3"/>
      <path d="M4 22h16"/>
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
      <path d="M18 2H6v7a6 6 0 0012 0V2z"/>
    </svg>
  ),
  plus: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M12 5v14M5 12h14"/>
    </svg>
  ),
  trash: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 6h18"/>
      <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6"/>
      <path d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
    </svg>
  ),
  sun: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="5"/>
      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
    </svg>
  ),
  moon: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
    </svg>
  ),
  arrowUp: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M7 17L17 7M17 7H7M17 7v10"/>
    </svg>
  ),
  chevronDown: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M6 9l6 6 6-6"/>
    </svg>
  ),
  send: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 2L11 13"/>
      <path d="M22 2l-7 20-4-9-9-4 20-7z"/>
    </svg>
  ),
  sparkle: () => (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2l2.4 7.2h7.6l-6 4.8 2.4 7.2-6-4.8-6 4.8 2.4-7.2-6-4.8h7.6z"/>
    </svg>
  ),
  clock: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10"/>
      <path d="M12 6v6l4 2"/>
    </svg>
  ),
  users: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
    </svg>
  ),
  focus: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  ),
  close: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M18 6L6 18M6 6l12 12"/>
    </svg>
  ),
  check: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
      <path d="M20 6L9 17l-5-5"/>
    </svg>
  ),
  paperPlane: () => (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M2 12l20-10-10 10 10 10-20-10z"/>
    </svg>
  ),
  chevronLeft: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M15 18l-6-6 6-6"/>
    </svg>
  ),
  invite: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 2L11 13"/>
      <path d="M22 2l-7 20-4-9-9-4 20-7z"/>
    </svg>
  ),
  faq: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10"/>
      <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/>
      <path d="M12 17h.01"/>
    </svg>
  )
}

function Sidebar() {
  const [activeItem, setActiveItem] = useState('todo')
  const [shareEnabled, setShareEnabled] = useState(false)
  const [theme, setTheme] = useState('light')

  const menuItems = [
    { id: 'todo', label: 'To-do', icon: Icons.todo },
    { id: 'impact', label: 'Share My Impact', icon: Icons.impact, hasToggle: true },
    { id: 'analytics', label: 'Analytics', icon: Icons.analytics },
    { id: 'leaderboard', label: 'Leaderboard', icon: Icons.leaderboard },
  ]

  const lists = [
    { id: 'projects', label: 'Projects', expanded: true, items: [
      { emoji: '🔥', label: 'Odama Website' },
      { emoji: '🏀', label: 'Dribbble' },
    ]},
    { id: 'personal', label: 'Personal Project', expanded: false, items: [] },
  ]

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="logo-icon">
          <Icons.logo />
        </div>
        <span className="logo-text">BetterTasks</span>
        <button className="sidebar-collapse">
          <Icons.chevronLeft />
        </button>
      </div>

      <div className="menu-section">
        <div className="menu-label">Main Menu</div>
        {menuItems.map(item => (
          <button
            key={item.id}
            className={`menu-item ${activeItem === item.id ? 'active' : ''}`}
            onClick={() => setActiveItem(item.id)}
          >
            <item.icon />
            <span>{item.label}</span>
            {item.hasToggle && (
              <div 
                className={`toggle-switch ${shareEnabled ? 'on' : ''}`}
                onClick={(e) => { e.stopPropagation(); setShareEnabled(!shareEnabled) }}
              >
                <div className="toggle-knob"></div>
              </div>
            )}
          </button>
        ))}
      </div>

      <div className="lists-section">
        <div className="lists-header">
          <span className="menu-label">Lists</span>
          <div className="lists-actions">
            <button className="icon-btn"><Icons.plus /></button>
          </div>
        </div>
        {lists.map(list => (
          <div key={list.id}>
            <div className="menu-item" style={{ paddingLeft: '12px' }}>
              <span style={{ fontSize: '12px' }}>{list.expanded ? '▼' : '▶'}</span>
              <span>{list.label}</span>
              <div className="lists-actions" style={{ marginLeft: 'auto' }}>
                <button className="icon-btn"><Icons.plus /></button>
                <button className="icon-btn"><Icons.trash /></button>
              </div>
            </div>
            {list.expanded && list.items.map((sub, idx) => (
              <div key={idx} className="list-item">
                <span className="emoji">{sub.emoji}</span>
                <span>{sub.label}</span>
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="upgrade-card">
        <h3>Upgrade plan</h3>
        <p>Unlock your personal to-do workspace, share your impact with multiple people and much more.</p>
        <button className="upgrade-arrow">
          <Icons.arrowUp />
        </button>
      </div>

      <div className="menu-item">
        <Icons.invite />
        <span>Invites</span>
      </div>
      <div className="menu-item">
        <Icons.faq />
        <span>FAQs</span>
      </div>

      <div className="theme-toggle">
        <button className={`theme-btn ${theme === 'light' ? 'active' : ''}`} onClick={() => setTheme('light')}>
          <Icons.sun /> Light
        </button>
        <button className={`theme-btn ${theme === 'dark' ? 'active' : ''}`} onClick={() => setTheme('dark')}>
          <Icons.moon /> Dark
        </button>
      </div>

      <div className="user-profile">
        <img 
          src="https://api.dicebear.com/7.x/avataaars/svg?seed=Pristia" 
          alt="User" 
          className="user-avatar" 
        />
        <div className="user-info">
          <div className="user-name">Pristia Candra</div>
          <div className="user-handle">Nameless panda #112</div>
        </div>
        <Icons.chevronDown />
      </div>
    </aside>
  )
}

export default Sidebar