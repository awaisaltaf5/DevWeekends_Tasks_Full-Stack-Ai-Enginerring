import React from 'react'
import StatsCards from '../components/StatsCards'
import AnalyticsChart from '../components/AnalyticsChart'
import TeamSection from '../components/TeamSection'

function DashboardPage({ tasks, teamMembers, onAddMember }) {
  const stats = {
    total: tasks.length,
    ended: tasks.filter(t => t.status === 'done').length,
    running: tasks.filter(t => t.status === 'progress').length,
    pending: tasks.filter(t => t.status === 'todo').length,
  }

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p>Plan, prioritize, and accomplish your tasks with ease.</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-primary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 5v14M5 12h14"/>
            </svg>
            Add Project
          </button>
          <button className="btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/>
            </svg>
            Import Data
          </button>
        </div>
      </div>

      <StatsCards stats={stats} />
      <AnalyticsChart tasks={tasks} />
      <TeamSection members={teamMembers} onAddMember={onAddMember} />
    </>
  )
}

export default DashboardPage
