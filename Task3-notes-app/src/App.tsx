import { useState, useEffect } from 'react'
import { useLocalStorage } from './hooks/useLocalStorage'
import Counter from './components/Counter'
import NoteForm from './components/NoteForm'
import NoteList from './components/NoteList'

function App() {
  // useState for UI state (not persisted)
  const [filter, setFilter] = useState('all')
  const [editingNote, setEditingNote] = useState(null)
  const [totalCounterValue, setTotalCounterValue] = useState(0)

  // Custom hook for persisted state (localStorage + useEffect)
  const [notes, setNotes] = useLocalStorage('notes-app-data', [])

  // useEffect for analytics/logging
  useEffect(() => {
    console.log(`App rendered. Total notes: ${notes.length}, Filter: ${filter}`)
  }, [notes.length, filter])

  // CRUD Operations passed as props to children
  const addNote = (note) => {
    setNotes(prev => [note, ...prev])
  }

  const updateNote = (updatedNote) => {
    setNotes(prev => prev.map(n => n.id === updatedNote.id ? updatedNote : n))
    setEditingNote(null)
  }

  const deleteNote = (id) => {
    setNotes(prev => prev.filter(n => n.id !== id))
  }

  const toggleComplete = (id) => {
    setNotes(prev => prev.map(n => 
      n.id === id ? { ...n, completed: !n.completed } : n
    ))
  }

  const handleEdit = (note) => {
    setEditingNote(note)
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const cancelEdit = () => {
    setEditingNote(null)
  }

  // Stats calculation
  const stats = {
    total: notes.length,
    completed: notes.filter(n => n.completed).length,
    high: notes.filter(n => n.priority === 'high').length
  }

  return (
    <div className="container">
      {/* Header */}
      <div className="header">
        <h1>🚀 React Fundamentals</h1>
        <p>Deliverable Notes Repo with Counter</p>
        
        {/* Stats display */}
        <div className="stats">
          <div className="stat-item">Total: {stats.total}</div>
          <div className="stat-item">Done: {stats.completed}</div>
          <div className="stat-item">High Priority: {stats.high}</div>
          <div className="stat-item">Counter: {totalCounterValue}</div>
        </div>
      </div>

      {/* Counter Section - demonstrates props passing */}
      <Counter 
        initialCount={0} 
        step={1} 
        onCountChange={setTotalCounterValue} 
      />

      {/* Note Form - demonstrates lifting state up */}
      <NoteForm 
        onAddNote={addNote}
        editNote={editingNote}
        onUpdateNote={updateNote}
        onCancelEdit={cancelEdit}
      />

      {/* Filter Tabs - conditional rendering */}
      <div className="card" style={{ padding: '1rem' }}>
        <div className="filter-tabs">
          {['all', 'active', 'completed', 'high'].map((f) => (
            <button
              key={f}
              className={`filter-btn ${filter === f ? 'active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Note List - demonstrates list rendering with keys */}
      <NoteList 
        notes={notes}
        filter={filter}
        onDelete={deleteNote}
        onEdit={handleEdit}
        onToggleComplete={toggleComplete}
      />
    </div>
  )
}

export default App