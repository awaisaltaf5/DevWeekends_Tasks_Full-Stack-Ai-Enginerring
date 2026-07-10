import React, { useState } from 'react'
import { Icons } from '../components/Icons'
import AddMemberModal from '../components/AddMemberModal'

function TeamPage({ members, onAddMember, onRemoveMember }) {
  const [showModal, setShowModal] = useState(false)
  const [search, setSearch] = useState('')

  const filtered = members.filter(m => 
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.role.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="team-page">
      <div className="team-header">
        <div>
          <h2>Team Members</h2>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            {members.length} members in your team
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Icons.plus /> Add Member
        </button>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Search members..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            width: '100%',
            maxWidth: '400px',
            padding: '12px 16px',
            border: '1.5px solid var(--border-light)',
            borderRadius: '10px',
            fontSize: '14px',
            fontFamily: 'inherit',
            outline: 'none',
          }}
        />
      </div>

      <div className="team-list">
        {filtered.map(member => (
          <div key={member.id} className="team-card-item">
            <img src={member.avatar} alt={member.name} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '16px', fontWeight: 700 }}>{member.name}</div>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{member.role}</div>
              <div style={{ fontSize: '12px', color: 'var(--accent-purple)', marginTop: '4px' }}>
                Working on: {member.task}
              </div>
            </div>
            <span className={`member-status ${member.status === 'Completed' ? 'status-completed' : 'status-progress'}`}>
              {member.status}
            </span>
            <button 
              className="icon-btn" 
              onClick={() => onRemoveMember(member.id)}
              style={{ marginLeft: '8px' }}
            >
              <Icons.trash />
            </button>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">👥</div>
          <h3>No members found</h3>
          <p>Add team members to collaborate on projects.</p>
        </div>
      )}

      {showModal && (
        <AddMemberModal 
          onClose={() => setShowModal(false)} 
          onAdd={onAddMember} 
        />
      )}
    </div>
  )
}

export default TeamPage
