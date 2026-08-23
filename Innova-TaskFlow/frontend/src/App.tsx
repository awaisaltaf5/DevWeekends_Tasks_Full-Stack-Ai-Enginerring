import './App.css'
import { HiClipboardList, HiViewList, HiViewBoards, HiCalendar } from 'react-icons/hi'
import TaskList from './components/TaskList'

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <div className="app-nav">
          <div className="brand">
            <div className="brand-icon" aria-hidden="true">
              <HiClipboardList />
            </div>
            <div className="brand-text">
              <span className="brand-name">Innova-TaskFlow</span>
              <span className="brand-sub">Smart Task Manager</span>
            </div>
          </div>

          <nav className="view-nav" aria-label="Task views">
            <button className="view-tab active" type="button" aria-current="page" title="List view">
              <HiViewList className="view-tab-icon" aria-hidden="true" />
              List
            </button>
            <button
              className="view-tab"
              type="button"
              disabled
              title="Kanban view - coming soon"
              aria-disabled="true"
            >
              <HiViewBoards className="view-tab-icon" aria-hidden="true" />
              Kanban
            </button>
            <button
              className="view-tab"
              type="button"
              disabled
              title="Calendar view - coming soon"
              aria-disabled="true"
            >
              <HiCalendar className="view-tab-icon" aria-hidden="true" />
              Calendar
            </button>
          </nav>
        </div>
      </header>

      <main className="app-main">
        <TaskList />
      </main>

      <footer className="app-footer">
        <span>Innova-TaskFlow · Built with React, Express &amp; MongoDB Atlas</span>
      </footer>
    </div>
  )
}

export default App