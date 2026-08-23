import React, { useState } from 'react'
import { Icons } from '../components/Icons'

function TaskPage({ tasks, onAddTask, onUpdateTask, onDeleteTask }) {
  const [filter, setFilter] = useState('all')
  const [showForm, setShowForm] = useState(false)
  const [newTask, setNewTask] = useState({ title: '', priority: 'medium', status: 'todo' })

  const filtered = filter === 'all' ? tasks : tasks.filter(t => t.status === filter)

  const handleAdd = (e) => {
    e.preventDefault()
    if (!newTask.title.trim()) return
    onAddTask({
      id: Date.now(),
      title: newTask.title.trim(),
      priority: newTask.priority,
      status: newTask.status,
      createdAt: new Date().toISOString(),
    })
    setNewTask({ title: '', priority: 'medium', status: 'todo' })
    setShowForm(false)
  }

  const toggleStatus = (task) => {
    const next = task.status === 'todo' ? 'progress' : task.status === 'progress' ? 'done' : 'todo'
    onUpdateTask({ ...task, status: next })
  }

  return (
    <div className="task-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '22px', fontWeight: 700 }}>All Tasks</h2>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          <Icons.plus /> {showForm ? 'Cancel' : 'New Task'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} style={{ marginBottom: '24px', padding: '20px', background: 'var(--bg-input)', borderRadius: '12px' }}>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder="Task title..."
              value={newTask.title}
              onChange={e => setNewTask({ ...newTask, title: e.target.value })}
              style={{ flex: 1, padding: '12px 16px', border: '1.5px solid var(--border-light)', borderRadius: '10px', fontSize: '14px', fontFamily: 'inherit', outline: 'none', minWidth: '200px' }}
              autoFocus
            />
            <select
              value={newTask.priority}
              onChange={e => setNewTask({ ...newTask, priority: e.target.value })}
              style={{ padding: '12px 16px', border: '1.5px solid var(--border-light)', borderRadius: '10px', fontSize: '14px', fontFamily: 'inherit' }}
            >
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            <button type="submit" className="btn btn-primary">Add Task</button>
          </div>
        </form>
      )}

      <div className="task-filters">
        {['all', 'todo', 'progress', 'done'].map(f => (
          <button key={f} className={`filter-chip ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
            {f === 'all' ? 'All Tasks' : f === 'todo' ? 'To Do' : f === 'progress' ? 'In Progress' : 'Completed'}
          </button>
        ))}
      </div>

      <table className="task-table">
        <thead>
          <tr>
            <th>Task</th>
            <th>Priority</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map(task => (
            <tr key={task.id}>
              <td style={{ fontWeight: 500 }}>{task.title}</td>
              <td>
                <span className={`priority-pill priority-${task.priority}`}>
                  {task.priority}
                </span>
              </td>
              <td>
                <span 
                  className={`status-pill status-${task.status}`}
                  style={{ cursor: 'pointer' }}
                  onClick={() => toggleStatus(task)}
                >
                  {task.status === 'todo' ? 'To Do' : task.status === 'progress' ? 'In Progress' : 'Done'}
                </span>
              </td>
              <td>
                <button className="icon-btn" onClick={() => onDeleteTask(task.id)} style={{ width: '32px', height: '32px' }}>
                  <Icons.trash />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {filtered.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">📋</div>
          <h3>No tasks found</h3>
          <p>Create your first task to get started.</p>
        </div>
      )}
    </div>
  )
}

export default TaskPage
