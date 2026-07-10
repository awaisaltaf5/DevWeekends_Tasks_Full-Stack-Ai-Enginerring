import React from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'

const statusData = [
  { name: 'Completed', value: 47, color: '#10b981' },
  { name: 'In Progress', value: 13, color: '#7c3aed' },
  { name: 'Pending', value: 8, color: '#f59e0b' },
]

const weeklyData = [
  { day: 'Mon', completed: 6, created: 8 },
  { day: 'Tue', completed: 8, created: 5 },
  { day: 'Wed', completed: 5, created: 7 },
  { day: 'Thu', completed: 9, created: 6 },
  { day: 'Fri', completed: 7, created: 9 },
  { day: 'Sat', completed: 10, created: 4 },
  { day: 'Sun', completed: 4, created: 3 },
]

const priorityData = [
  { name: 'High', tasks: 24 },
  { name: 'Medium', tasks: 31 },
  { name: 'Low', tasks: 13 },
]

function AnalyticsPage({ tasks }) {
  const total = tasks.length
  const completed = tasks.filter(t => t.status === 'done').length
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0

  return (
    <div className="analytics-page">
      <div className="page-header">
        <div>
          <h1>Analytics</h1>
          <p>Track your project performance and productivity.</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card total">
          <div className="stat-card-header"><span>Total Tasks</span></div>
          <div className="stat-value">{total}</div>
        </div>
        <div className="stat-card ended">
          <div className="stat-card-header"><span>Completed</span></div>
          <div className="stat-value">{completed}</div>
        </div>
        <div className="stat-card running">
          <div className="stat-card-header"><span>In Progress</span></div>
          <div className="stat-value">{tasks.filter(t => t.status === 'progress').length}</div>
        </div>
        <div className="stat-card pending">
          <div className="stat-card-header"><span>Completion Rate</span></div>
          <div className="stat-value">{completionRate}%</div>
        </div>
      </div>

      <div className="analytics-card">
        <h3>Weekly Task Activity</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={weeklyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
            <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 24px rgba(0,0,0,0.1)' }} />
            <Legend />
            <Bar dataKey="completed" fill="#7c3aed" radius={[6, 6, 0, 0]} name="Completed" />
            <Bar dataKey="created" fill="#c4b5fd" radius={[6, 6, 0, 0]} name="Created" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div className="analytics-card">
          <h3>Task Status Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={4}
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="analytics-card">
          <h3>Tasks by Priority</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={priorityData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
              <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
              <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 24px rgba(0,0,0,0.1)' }} />
              <Bar dataKey="tasks" fill="#7c3aed" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

export default AnalyticsPage
