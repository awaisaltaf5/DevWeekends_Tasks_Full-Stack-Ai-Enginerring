const Icons = {
  check: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
      <path d="M20 6L9 17l-5-5"/>
    </svg>
  ),
  trash: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 6h18"/>
      <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6"/>
      <path d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
    </svg>
  )
}

function TaskItem({ task, onToggle, onDelete }) {
  const priorityConfig = {
    high: { label: 'High', class: 'priority-high' },
    medium: { label: 'Medium', class: 'priority-medium' },
    low: { label: 'Low', class: 'priority-low' },
  }

  const config = priorityConfig[task.priority] || priorityConfig.medium

  return (
    <div className="task-item">
      <div 
        className={`task-checkbox ${task.completed ? 'checked' : ''}`}
        onClick={() => onToggle(task.id)}
      >
        {task.completed && <Icons.check />}
      </div>
      <div className="task-content">
        <div className={`task-title ${task.completed ? 'completed' : ''}`}>
          {task.title}
        </div>
      </div>
      <div className={`priority-badge ${config.class}`}>
        <span className="priority-dot"></span>
        {config.label}
      </div>
      <button className="delete-btn" onClick={() => onDelete(task.id)}>
        <Icons.trash />
      </button>
    </div>
  )
}

export default TaskItem