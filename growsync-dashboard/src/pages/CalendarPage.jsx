import React, { useState } from 'react'
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns'
import { Icons } from '../components/Icons'

function CalendarPage({ tasks }) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(monthStart)
  const calendarStart = startOfWeek(monthStart)
  const calendarEnd = endOfWeek(monthEnd)

  const days = []
  let day = calendarStart
  while (day <= calendarEnd) {
    days.push(day)
    day = addDays(day, 1)
  }

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  const getTasksForDate = (date) => {
    return tasks.filter(t => {
      const taskDate = new Date(t.createdAt)
      return isSameDay(taskDate, date)
    })
  }

  return (
    <div className="calendar-page">
      <div className="calendar-header">
        <h2>{format(currentMonth, 'MMMM yyyy')}</h2>
        <div className="calendar-nav">
          <button className="icon-btn" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
            <Icons.chevronLeft />
          </button>
          <button className="icon-btn" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
            <Icons.chevronRight />
          </button>
        </div>
      </div>

      <div className="calendar-grid">
        {weekDays.map(d => (
          <div key={d} className="calendar-day-header">{d}</div>
        ))}
        {days.map((d, i) => {
          const tasksForDay = getTasksForDate(d)
          const isToday = isSameDay(d, new Date())
          const isCurrentMonth = isSameMonth(d, currentMonth)
          return (
            <div
              key={i}
              className={`calendar-day ${isToday ? 'today' : ''} ${tasksForDay.length > 0 ? 'has-event' : ''} ${!isCurrentMonth ? '' : ''}`}
              style={{ opacity: isCurrentMonth ? 1 : 0.3 }}
              onClick={() => setSelectedDate(d)}
            >
              <span style={{ fontSize: '14px', fontWeight: isToday ? 700 : 500 }}>{format(d, 'd')}</span>
              {tasksForDay.length > 0 && (
                <span style={{ fontSize: '10px', color: 'var(--accent-purple)', marginTop: '4px' }}>
                  {tasksForDay.length} task{tasksForDay.length > 1 ? 's' : ''}
                </span>
              )}
            </div>
          )
        })}
      </div>

      <div style={{ marginTop: '24px', padding: '20px', background: 'var(--bg-input)', borderRadius: '12px' }}>
        <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px' }}>
          Tasks for {format(selectedDate, 'MMMM d, yyyy')}
        </h4>
        {getTasksForDate(selectedDate).length === 0 ? (
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No tasks scheduled for this day.</p>
        ) : (
          getTasksForDate(selectedDate).map(t => (
            <div key={t.id} style={{ padding: '8px 0', fontSize: '14px', borderBottom: '1px solid var(--border-light)' }}>
              • {t.title}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default CalendarPage
