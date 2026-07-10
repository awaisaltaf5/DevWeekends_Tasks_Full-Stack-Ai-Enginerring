import { useState } from 'react'
import TaskItem from './TaskItem'

const Icons = {
  clock: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10"/>
      <path d="M12 6v6l4 2"/>
    </svg>
  ),
  sparkle: () => (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2l2.4 7.2h7.6l-6 4.8 2.4 7.2-6-4.8-6 4.8 2.4-7.2-6-4.8h7.6z"/>
    </svg>
  ),
  plus: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M12 5v14M5 12h14"/>
    </svg>
  ),
  info: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10"/>
      <path d="M12 16v-4M12 8h.01"/>
    </svg>
  )
}

function TaskList({ tasks, onToggle, onDelete, onAdd }) {
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskPriority, setNewTaskPriority] = useState('medium')
  const [showAddForm, setShowAddForm] = useState(false)

  const handleAdd = () => {
    if (!newTaskTitle.trim()) return
    onAdd({
      id: Date.now(),
      title: newTaskTitle.trim(),
      priority: newTaskPriority,
      completed: false,
      createdAt: new Date().toISOString()
    })
    setNewTaskTitle('')
    setShowAddForm(false)
  }

  return (
    <div className="task-section">
      <div className="task-header">
        <h2>Today Task</h2>
        <div className="task-actions">
          <button className="btn">
            <Icons.clock /> Focus Mode
          </button>
          <button className="btn btn-primary">
            <Icons.sparkle /> AI Assist
          </button>
        </div>
      </div>

      <div className="task-list">
        {tasks.map(task => (
          <TaskItem 
            key={task.id} 
            task={task} 
            onToggle={onToggle} 
            onDelete={onDelete} 
          />
        ))}
      </div>

      {showAddForm ? (
        <div className="add-task-row" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '12px' }}>
          <input
            type="text"
            className="form-control"
            placeholder="Enter task title..."
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
            style={{
              padding: '12px 16px',
              border: '1px solid var(--border-light)',
              borderRadius: '10px',
              fontSize: '14px',
              fontFamily: 'inherit',
              outline: 'none'
            }}
            autoFocus
          />
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Priority:</span>
            {['low', 'medium', 'high'].map(p => (
              <button
                key={p}
                onClick={() => setNewTaskPriority(p)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '20px',
                  border: 'none',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                  background: newTaskPriority === p 
                    ? p === 'high' ? '#fef3c7' : p === 'medium' ? '#dbeafe' : '#d1fae5'
                    : 'var(--bg-input)',
                  color: newTaskPriority === p
                    ? p === 'high' ? '#b45309' : p === 'medium' ? '#1e40af' : '#065f46'
                    : 'var(--text-secondary)'
                }}
              >
                {p}
              </button>
            ))}
            <button className="btn btn-finish" onClick={handleAdd} style={{ marginLeft: 'auto' }}>
              Add Task
            </button>
            <button className="btn" onClick={() => setShowAddForm(false)}>
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="add-task-row">
          <button className="btn-finish" onClick={() => {}}>
            Finish
          </button>
          <button className="add-task-btn" onClick={() => setShowAddForm(true)}>
            <Icons.plus /> Add Task
          </button>
          <button className="icon-btn" style={{ marginLeft: 'auto' }}>
            <Icons.info />
          </button>
        </div>
      )}
    </div>
  )
}

export default TaskList