import React from 'react'
import { Icons } from './Icons'

function Popup({ title, message, icon: Icon, onClose }) {
  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup" onClick={e => e.stopPropagation()}>
        <div className="popup-icon">
          {Icon ? <Icon /> : <Icons.info />}
        </div>
        <h3>{title}</h3>
        <p>{message}</p>
        <button className="popup-btn" onClick={onClose}>Got it</button>
      </div>
    </div>
  )
}

export default Popup
