import { useState } from 'react'

const Icons = {
  sparkle: () => (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2l2.4 7.2h7.6l-6 4.8 2.4 7.2-6-4.8-6 4.8 2.4-7.2-6-4.8h7.6z"/>
    </svg>
  ),
  close: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M18 6L6 18M6 6l12 12"/>
    </svg>
  ),
  aiAvatar: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 2a3 3 0 013 3v1h-6V5a3 3 0 013-3z"/>
      <path d="M19 9H5a2 2 0 00-2 2v8a2 2 0 002 2h14a2 2 0 002-2v-8a2 2 0 00-2-2z"/>
      <path d="M8 14h.01M12 14h.01M16 14h.01"/>
    </svg>
  ),
  send: () => (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M2 12l20-10-10 10 10 10-20-10z"/>
    </svg>
  )
}

const suggestions = [
  "Can you help me with my first task?",
  "Create a template for a product design doc",
  "What is the SQL query for sorting by date?"
]

function AIAssist() {
  const [input, setInput] = useState('')

  return (
    <div className="ai-panel">
      <div className="ai-header">
        <h3>AI Assist <span>✨</span></h3>
        <button className="icon-btn">
          <Icons.close />
        </button>
      </div>
      <p className="ai-subtitle">Knowledge, answers, ideas. One click away.</p>

      <div className="ai-welcome">
        <div className="ai-avatar">
          <Icons.aiAvatar />
        </div>
        <h4>Hi, Pristia</h4>
        <h3>How can I help you?</h3>
      </div>

      <div className="ai-suggestions">
        {suggestions.map((s, i) => (
          <button key={i} className="suggestion-chip" onClick={() => setInput(s)}>
            "{s}"
          </button>
        ))}
      </div>

      <div className="ai-input">
        <input
          type="text"
          placeholder="Write something.."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && setInput('')}
        />
        <button className="ai-send" onClick={() => input && setInput('')}>
          <Icons.send />
        </button>
      </div>
    </div>
  )
}

export default AIAssist