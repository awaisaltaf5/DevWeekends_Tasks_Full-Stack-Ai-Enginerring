import React, { useState } from 'react'
import { Icons } from './Icons'

function AddMemberModal({ onClose, onAdd }) {
  const [name, setName] = useState('')
  const [role, setRole] = useState('Developer')
  const [task, setTask] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name.trim()) return
    onAdd({
      id: Date.now(),
      name: name.trim(),
      role,
      task: task.trim() || 'New Assignment',
      status: 'In Progress',
      progress: 0,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name.trim())}`,
    })
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h3>Add Team Member</h3>
        <p>Invite a new member to your project team.</p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              placeholder="Enter member name..."
              value={name}
              onChange={e => setName(e.target.value)}
              autoFocus
            />
          </div>
          <div className="form-group">
            <label>Role</label>
            <select value={role} onChange={e => setRole(e.target.value)}>
              <option>Developer</option>
              <option>Designer</option>
              <option>Manager</option>
              <option>QA Engineer</option>
              <option>Product Owner</option>
            </select>
          </div>
          <div className="form-group">
            <label>Current Task</label>
            <input
              type="text"
              placeholder="What are they working on?"
              value={task}
              onChange={e => setTask(e.target.value)}
            />
          </div>
          <div className="modal-actions">
            <button type="button" className="btn" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">
              <Icons.plus /> Add Member
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddMemberModal
