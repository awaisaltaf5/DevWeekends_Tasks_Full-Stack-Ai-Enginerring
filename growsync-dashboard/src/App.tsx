import React, { useState, useEffect } from 'react'
import { useLocalStorage } from './hooks/useLocalStorage'
import Sidebar from './components/Sidebar'
import TopBar from './components/TopBar'
import Popup from './components/Popup'
import DashboardPage from './pages/DashboardPage'
import TaskPage from './pages/TaskPage'
import CalendarPage from './pages/CalendarPage'
import AnalyticsPage from './pages/AnalyticsPage'
import TeamPage from './pages/TeamPage'
import SettingsPage from './pages/SettingsPage'
import HelpPage from './pages/HelpPage'
import { Icons } from './components/Icons'

// Initial demo data
const initialTasks = [
  { id: 1, title: 'Create design system', priority: 'high', status: 'done', createdAt: '2026-07-08T10:00:00Z' },
  { id: 2, title: 'Create 3 alternative hero section', priority: 'medium', status: 'done', createdAt: '2026-07-09T14:00:00Z' },
  { id: 3, title: 'Upload dribbble shot', priority: 'low', status: 'done', createdAt: '2026-07-10T09:00:00Z' },
  { id: 4, title: 'Implement authentication', priority: 'high', status: 'progress', createdAt: '2026-07-10T11:00:00Z' },
  { id: 5, title: 'Write API documentation', priority: 'medium', status: 'todo', createdAt: '2026-07-10T12:00:00Z' },
  { id: 6, title: 'Fix responsive bugs', priority: 'low', status: 'todo', createdAt: '2026-07-10T13:00:00Z' },
  { id: 7, title: 'Optimize database queries', priority: 'high', status: 'progress', createdAt: '2026-07-09T16:00:00Z' },
  { id: 8, title: 'Setup CI/CD pipeline', priority: 'medium', status: 'todo', createdAt: '2026-07-08T11:00:00Z' },
]

const initialTeam = [
  { 
    id: 1, 
    name: 'Johnson', 
    role: 'Developer',
    task: 'Responsive Layout', 
    status: 'Completed', 
    progress: 100,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Johnson&backgroundColor=b6e3f4'
  },
  { 
    id: 2, 
    name: 'Alex', 
    role: 'Developer',
    task: 'Github Repository', 
    status: 'In Progress', 
    progress: 65,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex&backgroundColor=c0aede'
  },
  { 
    id: 3, 
    name: 'Sarah', 
    role: 'Designer',
    task: 'UI Components', 
    status: 'In Progress', 
    progress: 40,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah&backgroundColor=ffdfbf'
  },
]

const user = {
  name: 'Niki Zefanya',
  email: 'niki@gmail.com',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Niki&backgroundColor=ffdfbf'
}

function App() {
  const [activePage, setActivePage] = useLocalStorage('growsync-page', 'dashboard')
  const [tasks, setTasks] = useLocalStorage('growsync-tasks', initialTasks)
  const [teamMembers, setTeamMembers] = useLocalStorage('growsync-team', initialTeam)
  const [popup, setPopup] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')

  // Update document title based on page
  useEffect(() => {
    const pageNames = {
      dashboard: 'Dashboard',
      task: 'Tasks',
      calendar: 'Calendar',
      analytics: 'Analytics',
      team: 'Team',
      settings: 'Settings',
      help: 'Help',
    }
    document.title = `${pageNames[activePage] || 'Dashboard'} | GrowSync`
  }, [activePage])

  // Show popup helper
  const showPopup = (title, message, icon) => {
    setPopup({ title, message, icon })
  }

  // Navigation with popup for unavailable features
  const handleNavigate = (page) => {
    const unavailable = ['download', 'profile']
    if (unavailable.includes(page)) {
      showPopup(
        'Coming Soon',
        'This feature is currently under development and will be available in a future update. Stay tuned!',
        Icons.sparkle
      )
      return
    }
    setActivePage(page)
  }

  // Task CRUD operations
  const addTask = (task) => {
    setTasks(prev => [...prev, task])
  }

  const updateTask = (updated) => {
    setTasks(prev => prev.map(t => t.id === updated.id ? updated : t))
  }

  const deleteTask = (id) => {
    setTasks(prev => prev.filter(t => t.id !== id))
  }

  // Team operations
  const addTeamMember = (member) => {
    setTeamMembers(prev => [...prev, member])
  }

  const removeTeamMember = (id) => {
    setTeamMembers(prev => prev.filter(m => m.id !== id))
  }

  // Logout handler
  const handleLogout = () => {
    showPopup(
      'Logged Out',
      'You have been successfully logged out. See you soon!',
      Icons.check
    )
    setTimeout(() => {
      setActivePage('dashboard')
    }, 2000)
  }

  // Filter tasks by search
  const filteredTasks = searchQuery 
    ? tasks.filter(t => t.title.toLowerCase().includes(searchQuery.toLowerCase()))
    : tasks

  // Render current page
  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return <DashboardPage tasks={filteredTasks} teamMembers={teamMembers} onAddMember={addTeamMember} />
      case 'task':
        return <TaskPage tasks={filteredTasks} onAddTask={addTask} onUpdateTask={updateTask} onDeleteTask={deleteTask} />
      case 'calendar':
        return <CalendarPage tasks={filteredTasks} />
      case 'analytics':
        return <AnalyticsPage tasks={filteredTasks} />
      case 'team':
        return <TeamPage members={teamMembers} onAddMember={addTeamMember} onRemoveMember={removeTeamMember} />
      case 'settings':
        return <SettingsPage />
      case 'help':
        return <HelpPage />
      default:
        return <DashboardPage tasks={filteredTasks} teamMembers={teamMembers} onAddMember={addTeamMember} />
    }
  }

  return (
    <div className="app-container">
      <Sidebar 
        activePage={activePage} 
        onNavigate={handleNavigate} 
        user={user}
        onLogout={handleLogout}
      />

      <div className="main-content">
        <TopBar user={user} onSearch={setSearchQuery} />
        {renderPage()}
      </div>

      {popup && (
        <Popup
          title={popup.title}
          message={popup.message}
          icon={popup.icon}
          onClose={() => setPopup(null)}
        />
      )}
    </div>
  )
}

export default App
