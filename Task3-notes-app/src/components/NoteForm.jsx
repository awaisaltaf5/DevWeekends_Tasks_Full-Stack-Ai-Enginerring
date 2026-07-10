import { useState, useEffect } from 'react'

// Component receiving callback props from parent
function NoteForm({ onAddNote, editNote, onUpdateNote, onCancelEdit }) {
  // Local state for form fields
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [priority, setPriority] = useState('medium')
  const [errors, setErrors] = useState({})

  // useEffect to populate form when editing
  useEffect(() => {
    if (editNote) {
      setTitle(editNote.title)
      setContent(editNote.content)
      setPriority(editNote.priority)
    }
  }, [editNote]) // Re-run when editNote changes

  const validate = () => {
    const newErrors = {}
    if (!title.trim()) newErrors.title = 'Title is required'
    if (!content.trim()) newErrors.content = 'Content is required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!validate()) return

    const noteData = {
      title: title.trim(),
      content: content.trim(),
      priority,
      createdAt: new Date().toISOString(),
      id: editNote ? editNote.id : Date.now()
    }

    if (editNote) {
      onUpdateNote(noteData)
    } else {
      onAddNote(noteData)
    }

    // Reset form
    setTitle('')
    setContent('')
    setPriority('medium')
    setErrors({})
  }

  const handleCancel = () => {
    setTitle('')
    setContent('')
    setPriority('medium')
    setErrors({})
    onCancelEdit()
  }

  return (
    <div className="card fade-in">
      <h2 style={{ marginBottom: '1rem' }}>
        {editNote ? '✏️ Edit Note' : '➕ Create New Note'}
      </h2>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Title</label>
          <input
            type="text"
            id="title"
            className="form-control"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter note title..."
          />
          {/* Conditional rendering for error message */}
          {errors.title && (
            <span style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>
              {errors.title}
            </span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="content">Content</label>
          <textarea
            id="content"
            className="form-control"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Enter note content..."
          />
          {errors.content && (
            <span style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>
              {errors.content}
            </span>
          )}
        </div>

        <div className="form-group">
          <label>Priority</label>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {['low', 'medium', 'high'].map((p) => (
              <button
                key={p}
                type="button"
                className={`filter-btn ${priority === p ? 'active' : ''}`}
                onClick={() => setPriority(p)}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button type="submit" className="btn btn-primary">
            {editNote ? 'Update Note' : 'Add Note'}
          </button>
          {editNote && (
            <button type="button" className="btn btn-secondary" onClick={handleCancel}>
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  )
}

export default NoteForm