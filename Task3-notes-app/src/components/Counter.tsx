import { useState, useEffect } from 'react'

// Functional component with props destructuring
function Counter({ initialCount = 0, step = 1, onCountChange }) {
  // useState with initial value and updater function
  const [count, setCount] = useState(initialCount)
  const [history, setHistory] = useState([])

  // useEffect with cleanup - demonstrates side effects
  useEffect(() => {
    // Update document title when count changes
    document.title = `Count: ${count} | Notes App`
    
    // Cleanup function (runs before next effect or unmount)
    return () => {
      document.title = 'Notes App'
    }
  }, [count]) // Only re-run when count changes

  // useEffect with empty dependency array - runs once on mount
  useEffect(() => {
    console.log('Counter mounted!')
    return () => console.log('Counter unmounted!')
  }, [])

  // Handler functions using updater form of setState
  const increment = () => {
    setCount(prev => prev + step)
    addToHistory('increment')
  }

  const decrement = () => {
    setCount(prev => prev - step)
    addToHistory('decrement')
  }

  const reset = () => {
    setCount(initialCount)
    setHistory([])
  }

  const addToHistory = (action) => {
    setHistory(prev => [...prev, { action, timestamp: new Date().toLocaleTimeString() }])
  }

  // Notify parent component via callback prop
  useEffect(() => {
    if (onCountChange) {
      onCountChange(count)
    }
  }, [count, onCountChange])

  return (
    <div className="card fade-in">
      <h2 style={{ marginBottom: '1rem', textAlign: 'center' }}>🔢 Counter Component</h2>
      
      <div className="counter-section">
        <button className="btn btn-danger" onClick={decrement}>
          −{step}
        </button>
        
        <div className="counter-display">{count}</div>
        
        <button className="btn btn-success" onClick={increment}>
          +{step}
        </button>
      </div>

      <div style={{ textAlign: 'center', marginTop: '1rem' }}>
        <button className="btn btn-secondary" onClick={reset}>
          Reset
        </button>
      </div>

      {/* Conditional rendering based on history length */}
      {history.length > 0 && (
        <div style={{ marginTop: '1rem', fontSize: '0.875rem', color: '#6b7280' }}>
          <p style={{ fontWeight: '600', marginBottom: '0.5rem' }}>Recent Actions:</p>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {/* List rendering with keys */}
            {history.slice(-3).map((item, index) => (
              <li key={index} style={{ marginBottom: '0.25rem' }}>
                {item.action === 'increment' ? '⬆️' : '⬇️'} {item.action} at {item.timestamp}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export default Counter