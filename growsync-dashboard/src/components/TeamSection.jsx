import React, { useState } from 'react'
import { Icons } from './Icons'
import AddMemberModal from './AddMemberModal'

function TeamSection({ members, onAddMember }) {
  const [showModal, setShowModal] = useState(false)

  return (
    <>
      <div className="team-section">
        <div className="team-card">
          <div className="team-card-header">
            <h3>Team Collaboration</h3>
            <button className="btn" onClick={() => setShowModal(true)}>
              <Icons.plus /> Add Member
            </button>
          </div>
          <div className="team-grid">
            {members.map(member => (
              <div key={member.id} className="team-member">
                <div className="member-top-row">
                  <img src={member.avatar} alt={member.name} />
                  <div className="member-info">
                    <div className="member-name">{member.name}</div>
                    <div className="member-task">
                      Working on <span>{member.task}</span>
                    </div>
                    <span className={`member-status ${member.status === 'Completed' ? 'status-completed' : 'status-progress'}`}>
                      {member.status}
                    </span>
                  </div>
                </div>
                <div className="member-progress" style={{ width: '100%' }}>
                  <div 
                    className="member-progress-bar" 
                    style={{ width: `${member.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <TimeTracker />
      </div>
      {showModal && (
        <AddMemberModal 
          onClose={() => setShowModal(false)} 
          onAdd={onAddMember} 
        />
      )}
    </>
  )
}

function TimeTracker() {
  const [time, setTime] = useState(9240)
  const [isRunning, setIsRunning] = useState(false)
  const intervalRef = React.useRef(null)

  React.useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTime(t => t + 1)
      }, 1000)
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isRunning])

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600).toString().padStart(2, '0')
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0')
    const s = (seconds % 60).toString().padStart(2, '0')
    return `${h}:${m}:${s}`
  }

  return (
    <div className="tracker-card">
      <h3>Time Tracker</h3>
      <div className="tracker-time">{formatTime(time)}</div>
      <div className="tracker-controls">
        <button 
          className="tracker-btn play" 
          onClick={() => setIsRunning(!isRunning)}
        >
          {isRunning ? <Icons.pause /> : <Icons.play />}
        </button>
        <button 
          className="tracker-btn stop" 
          onClick={() => { setIsRunning(false); setTime(0) }}
        >
          <Icons.stop />
        </button>
      </div>
    </div>
  )
}

export default TeamSection
