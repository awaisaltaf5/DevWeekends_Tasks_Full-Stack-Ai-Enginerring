import React from 'react'
import { Icons } from './Icons'

function Sidebar({ activePage, onNavigate, user, onLogout }) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Icons.dashboard },
    { id: 'task', label: 'Task', icon: Icons.task, badge: 15 },
    { id: 'calendar', label: 'Calendar', icon: Icons.calendar },
    { id: 'analytics', label: 'Analytics', icon: Icons.analytics },
    { id: 'team', label: 'Team', icon: Icons.team },
  ]

  const generalItems = [
    { id: 'settings', label: 'Settings', icon: Icons.settings },
    { id: 'help', label: 'Help', icon: Icons.help },
    { id: 'logout', label: 'Logout', icon: Icons.logout },
  ]

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="logo-icon">
          <Icons.logo />
        </div>
        <span className="logo-text">GrowSync<span className="logo-tm">™</span></span>
      </div>

      <div className="menu-section">
        <div className="menu-label">Menu</div>
        {menuItems.map(item => (
          <button
            key={item.id}
            className={`menu-item ${activePage === item.id ? 'active' : ''}`}
            onClick={() => onNavigate(item.id)}
          >
            <item.icon />
            <span>{item.label}</span>
            {item.badge && <span className="badge">{item.badge}</span>}
          </button>
        ))}
      </div>

      <div className="menu-section">
        <div className="menu-label">General</div>
        {generalItems.map(item => (
          <button
            key={item.id}
            className={`menu-item ${activePage === item.id ? 'active' : ''}`}
            onClick={() => {
              if (item.id === 'logout') {
                onLogout()
              } else {
                onNavigate(item.id)
              }
            }}
          >
            <item.icon />
            <span>{item.label}</span>
          </button>
        ))}
      </div>

      <div className="download-card">
        <h3>Download Our Mobile App</h3>
        <p>Get easy in another way</p>
        <button className="download-btn" onClick={() => onNavigate('download')}>
          <Icons.download /> Download
        </button>
      </div>

      <div className="user-profile" onClick={() => onNavigate('profile')}>
        <img 
          src={user.avatar} 
          alt={user.name} 
          className="user-avatar" 
        />
        <div className="user-info">
          <div className="user-name">{user.name}</div>
          <div className="user-email">{user.email}</div>
        </div>
        <Icons.arrowDown />
      </div>
    </aside>
  )
}

export default Sidebar
