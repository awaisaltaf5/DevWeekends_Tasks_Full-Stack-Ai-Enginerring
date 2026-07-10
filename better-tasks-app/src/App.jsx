import { useState, useEffect } from 'react'
import { useLocalStorage } from './hooks/useLocalStorage'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import ProfileCard from './components/ProfileCard'
import TaskList from './components/TaskList'
import AIAssist from './components/AIAssist'

function App() {
  const [tasks, setTasks] = useLocalStorage('better-tasks', [
    { id: 1, title: 'Create design system', priority: 'high', completed: true, createdAt: new Date().toISOString() },
    { id: 2, title: 'Create 3 alternative hero section', priority: 'medium', completed: true, createdAt: new Date().toISOString() },
    { id: 3, title: 'Upload dribbble shot', priority: 'low', completed: true, createdAt: new Date().toISOString() },
  ])

  // useEffect - update document title when tasks change
  useEffect(() => {
    const completed = tasks.filter(t => t.completed).length
    document.title = `BetterTasks (${completed}/${tasks.length})`
  }, [tasks])

  const toggleTask = (id) => {
    setTasks(prev => prev.map(t => 
      t.id === id ? { ...t, completed: !t.completed } : t
    ))
  }

  const deleteTask = (id) => {
    setTasks(prev => prev.filter(t => t.id !== id))
  }

  const addTask = (task) => {
    setTasks(prev => [...prev, task])
  }

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <Header />
        <ProfileCard />
        <TaskList 
          tasks={tasks} 
          onToggle={toggleTask} 
          onDelete={deleteTask}
          onAdd={addTask}
        />
      </div>
      <AIAssist />
    </div>
  )
}

export default App