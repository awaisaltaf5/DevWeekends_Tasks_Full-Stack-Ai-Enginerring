// Functional component with destructured props
function NoteCard({ note, onDelete, onEdit, onToggleComplete }) {
  // Format date helper
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Conditional class based on priority
  const priorityClass = `note-card priority-${note.priority}`

  return (
    <div className={`${priorityClass} fade-in`}>
      <div className="note-header">
        <h3 className="note-title" style={{ textDecoration: note.completed ? 'line-through' : 'none' }}>
          {note.title}
        </h3>
        <span className={`priority-badge priority-${note.priority}`}>
          {note.priority}
        </span>
      </div>
      
      <div className="note-meta">
        <span>📅 {formatDate(note.createdAt)}</span>
        {note.completed && <span>✅ Completed</span>}
      </div>
      
      <p className="note-content">{note.content}</p>
      
      <div className="note-actions">
        <button 
          className="btn btn-success" 
          onClick={() => onToggleComplete(note.id)}
          style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
        >
          {note.completed ? 'Undo' : 'Complete'}
        </button>
        <button 
          className="btn btn-primary" 
          onClick={() => onEdit(note)}
          style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
        >
          Edit
        </button>
        <button 
          className="btn btn-danger" 
          onClick={() => onDelete(note.id)}
          style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
        >
          Delete
        </button>
      </div>
    </div>
  )
}

export default NoteCard