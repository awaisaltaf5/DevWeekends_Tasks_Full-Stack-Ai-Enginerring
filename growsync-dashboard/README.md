# GrowSync Dashboard

A fully functional, beautiful project management dashboard built with React + Vite.

## Features

- **Dashboard** - Overview with stats cards, analytics charts, team collaboration, and time tracker
- **Tasks** - Full CRUD (Create, Read, Update, Delete) with priority levels and status filtering
- **Calendar** - Interactive monthly calendar with task scheduling using date-fns
- **Analytics** - Recharts-powered bar charts, pie charts, and area charts for project insights
- **Team** - Add/remove team members with role assignment and progress tracking
- **Settings** - Toggle switches for notifications, dark mode, auto-save, and privacy
- **Help** - FAQ section with common questions and answers
- **Time Tracker** - Working stopwatch with play/pause/reset functionality
- **Local Storage** - All data persists across browser sessions

## Tech Stack

- React 18 + Vite
- Recharts (charts/graphs)
- date-fns (calendar)
- DiceBear API (avatars)
- Inline SVG icons (no external icon library needed)
- CSS custom properties (design tokens)

## Setup

```bash
# 1. Extract the zip file
cd growsync-dashboard

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev

# 4. Open browser at http://localhost:5173
```

## Project Structure

```
growsync-dashboard/
├── index.html
├── package.json
├── vite.config.js
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── index.css
│   ├── components/
│   │   ├── Icons.jsx          # All inline SVG icons
│   │   ├── Sidebar.jsx        # Navigation sidebar
│   │   ├── TopBar.jsx         # Search + user actions
│   │   ├── StatsCards.jsx     # 4 stat cards (Total/Ended/Running/Pending)
│   │   ├── AnalyticsChart.jsx # Area chart + meeting card
│   │   ├── TeamSection.jsx    # Team grid + Time Tracker
│   │   ├── Popup.jsx          # Modal popup component
│   │   └── AddMemberModal.jsx # Add team member form
│   ├── hooks/
│   │   ├── useLocalStorage.js # Persist state to localStorage
│   │   └── useTimer.js        # Timer hook (unused, included for reference)
│   └── pages/
│       ├── DashboardPage.jsx  # Main dashboard view
│       ├── TaskPage.jsx       # Task management with CRUD
│       ├── CalendarPage.jsx   # Monthly calendar with tasks
│       ├── AnalyticsPage.jsx  # Full analytics with charts
│       ├── TeamPage.jsx       # Team member management
│       ├── SettingsPage.jsx   # App settings toggles
│       └── HelpPage.jsx       # FAQ and support
```

## Acceptance Criteria Coverage

| Criteria | Implementation |
|----------|---------------|
| **Functional Components** | All 15+ components are functional with props |
| **Props Passing** | Extensive prop drilling for tasks, members, callbacks |
| **useState** | Used in every interactive component (Sidebar, TaskPage, Calendar, Settings, etc.) |
| **useEffect** | Document title updates, localStorage sync, timer intervals |
| **Conditional Rendering** | Empty states, popups, active menus, form toggles, filter chips |
| **List Rendering with Keys** | tasks.map, members.map, calendar days, suggestions, settings |

## Avatars & Images

All avatars are generated using the free **DiceBear API**:
- `https://api.dicebear.com/7.x/avataaars/svg?seed=NAME`

No local images needed - everything loads from the internet!
