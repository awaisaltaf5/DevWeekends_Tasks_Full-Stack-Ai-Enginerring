// Functional component receiving props
function EmptyState({ type = 'notes', onCreateClick }) {
  // Conditional rendering based on type prop
  const content = {
    notes: {
      icon: '📝',
      title: 'No Notes Yet',
      description: 'Get started by creating your first note above!'
    },
    filtered: {
      icon: '🔍',
      title: 'No Matches Found',
      description: 'Try adjusting your filter criteria.'
    }
  }

  const { icon, title, description } = content[type] || content.notes

  return (
    <div className="empty-state fade-in">
      <div className="empty-state-icon">{icon}</div>
      <h3 style={{ marginBottom: '0.5rem', color: '#374151' }}>{title}</h3>
      <p>{description}</p>
      {onCreateClick && (
        <button 
          className="btn btn-primary" 
          onClick={onCreateClick}
          style={{ marginTop: '1rem' }}
        >
          Create Note
        </button>
      )}
    </div>
  )
}

export default EmptyState