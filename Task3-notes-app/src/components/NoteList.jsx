import NoteCard from './NoteCard'
import EmptyState from './EmptyState'

// Component receiving array and callbacks via props
function NoteList({ notes, filter, onDelete, onEdit, onToggleComplete }) {
  // Filter logic based on prop
  const filteredNotes = notes.filter(note => {
    if (filter === 'all') return true
    if (filter === 'completed') return note.completed
    if (filter === 'active') return !note.completed
    if (filter === 'high') return note.priority === 'high'
    return true
  })

  // Sort by date (newest first)
  const sortedNotes = [...filteredNotes].sort((a, b) => 
    new Date(b.createdAt) - new Date(a.createdAt)
  )

  // Conditional rendering: if no notes exist at all
  if (notes.length === 0) {
    return <EmptyState type="notes" />
  }

  // Conditional rendering: if filtered list is empty
  if (sortedNotes.length === 0) {
    return <EmptyState type="filtered" />
  }

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2>📝 Your Notes</h2>
        <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>
          {sortedNotes.length} {sortedNotes.length === 1 ? 'note' : 'notes'}
        </span>
      </div>

      <div className="note-grid">
        {/* List rendering with unique keys */}
        {sortedNotes.map((note) => (
          <NoteCard
            key={note.id} // Unique key for React reconciliation
            note={note}   // Passing object as prop
            onDelete={onDelete}
            onEdit={onEdit}
            onToggleComplete={onToggleComplete}
          />
        ))}
      </div>
    </div>
  )
}

export default NoteList