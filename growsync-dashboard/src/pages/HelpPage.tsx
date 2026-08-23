import React from 'react'

function HelpPage() {
  const faqs = [
    { q: 'How do I create a new task?', a: 'Click the "New Task" button on the Task page, enter your task details, and click Add Task.' },
    { q: 'How does the time tracker work?', a: 'The time tracker on the Dashboard allows you to track time spent on tasks. Click the play button to start and the stop button to reset.' },
    { q: 'Can I add team members?', a: 'Yes! Go to the Team page and click "Add Member" to invite collaborators to your project.' },
    { q: 'How do I view analytics?', a: 'Navigate to the Analytics page to see detailed charts and statistics about your project progress.' },
    { q: 'Is my data saved?', a: "Yes, all your tasks and settings are automatically saved to your browser's local storage." },
  ]

  return (
    <div className="settings-page">
      <div className="page-header" style={{ marginBottom: '24px' }}>
        <div>
          <h1>Help & Support</h1>
          <p>Find answers to common questions and get support.</p>
        </div>
      </div>

      <div className="settings-section">
        <h3>Frequently Asked Questions</h3>
        {faqs.map((faq, i) => (
          <div key={i} style={{ padding: '16px 0', borderBottom: '1px solid var(--border-light)' }}>
            <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '6px' }}>{faq.q}</h4>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{faq.a}</p>
          </div>
        ))}
      </div>

      <div className="settings-section">
        <h3>Contact Support</h3>
        <div style={{ padding: '16px 0' }}>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
            Need more help? Reach out to our support team.
          </p>
          <button className="btn btn-primary">Contact Support</button>
        </div>
      </div>
    </div>
  )
}

export default HelpPage
