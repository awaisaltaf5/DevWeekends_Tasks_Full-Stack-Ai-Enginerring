import React, { useState } from 'react'

function SettingsPage() {
  const [settings, setSettings] = useState({
    notifications: true,
    emailAlerts: true,
    darkMode: false,
    autoSave: true,
    publicProfile: false,
  })

  const toggle = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const sections = [
    {
      title: 'Notifications',
      items: [
        { key: 'notifications', label: 'Push Notifications', desc: 'Receive push notifications for task updates' },
        { key: 'emailAlerts', label: 'Email Alerts', desc: 'Get email notifications for important events' },
      ]
    },
    {
      title: 'Preferences',
      items: [
        { key: 'darkMode', label: 'Dark Mode', desc: 'Switch to dark theme for better night viewing' },
        { key: 'autoSave', label: 'Auto Save', desc: 'Automatically save your work every 30 seconds' },
      ]
    },
    {
      title: 'Privacy',
      items: [
        { key: 'publicProfile', label: 'Public Profile', desc: 'Make your profile visible to other team members' },
      ]
    },
  ]

  return (
    <div className="settings-page">
      <div className="page-header" style={{ marginBottom: '24px' }}>
        <div>
          <h1>Settings</h1>
          <p>Manage your account preferences and application settings.</p>
        </div>
      </div>

      {sections.map(section => (
        <div key={section.title} className="settings-section">
          <h3>{section.title}</h3>
          {section.items.map(item => (
            <div key={item.key} className="setting-item">
              <div className="setting-info">
                <h4>{item.label}</h4>
                <p>{item.desc}</p>
              </div>
              <div 
                className={`switch ${settings[item.key] ? 'on' : ''}`}
                onClick={() => toggle(item.key)}
              >
                <div className="switch-knob"></div>
              </div>
            </div>
          ))}
        </div>
      ))}

      <div className="settings-section">
        <h3>Account</h3>
        <div className="setting-item">
          <div className="setting-info">
            <h4>Change Password</h4>
            <p>Update your password for better security</p>
          </div>
          <button className="btn">Change</button>
        </div>
        <div className="setting-item">
          <div className="setting-info">
            <h4>Delete Account</h4>
            <p style={{ color: 'var(--accent-red)' }}>Permanently delete your account and all data</p>
          </div>
          <button className="btn" style={{ borderColor: 'var(--accent-red)', color: 'var(--accent-red)' }}>
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}

export default SettingsPage
