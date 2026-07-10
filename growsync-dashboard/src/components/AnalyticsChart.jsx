import React from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Icons } from './Icons'

const weeklyData = [
  { day: 'S', tasks: 4 },
  { day: 'M', tasks: 6 },
  { day: 'T', tasks: 8 },
  { day: 'W', tasks: 5 },
  { day: 'T', tasks: 9 },
  { day: 'F', tasks: 7 },
  { day: 'S', tasks: 10 },
]

function AnalyticsChart({ tasks }) {
  const completed = tasks.filter(t => t.status === 'done').length
  const total = tasks.length

  return (
    <div className="chart-section">
      <div className="chart-card">
        <h3>Project Analytics</h3>
        <div className="chart-completion">
          <span className="big">{completed}</span>
          <span className="small">/ {total}</span>
        </div>
        <div className="chart-subtitle" style={{ marginBottom: '24px' }}>Completed</div>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={weeklyData}>
            <defs>
              <linearGradient id="colorTasks" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#7c3aed" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
            <YAxis hide />
            <Tooltip 
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 24px rgba(0,0,0,0.1)' }}
              formatter={(value) => [`${value} tasks`, 'Tasks']}
            />
            <Area 
              type="monotone" 
              dataKey="tasks" 
              stroke="#7c3aed" 
              strokeWidth={2}
              fill="url(#colorTasks)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="meeting-card">
        <div className="meeting-header">
          <div className="meeting-icon">
            <Icons.video />
          </div>
          <div className="meeting-info">
            <h4>Upcoming Meetings</h4>
            <p>Time: 02.00 pm - 04.00 pm</p>
          </div>
        </div>
        <div className="meeting-title">Meeting with HTX Company</div>
        <button className="meeting-btn" onClick={() => alert('Meeting functionality coming soon!')}>
          Start Meeting
        </button>
      </div>
    </div>
  )
}

export default AnalyticsChart
