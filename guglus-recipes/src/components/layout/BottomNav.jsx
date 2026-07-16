import { NavLink, useLocation } from 'react-router-dom'
import { Home, Search, Bookmark, User, Plus } from 'lucide-react'
import logo from '../../assets/logoo.png'

const navItems = [
  { path: '/home', icon: Home, label: 'Home' },
  { path: '/search', icon: Search, label: 'Search' },
  { path: '/create', icon: Plus, label: 'Create' },
  { path: '/saved', icon: Bookmark, label: 'Saved' },
  { path: '/profile', icon: User, label: 'Profile' },
]

export default function BottomNav() {
  const location = useLocation()
  
  // Hide bottom nav on welcome page
  if (location.pathname === '/') return null

  return (
    <>
      {/* Mobile: Top Logo Bar */}
      <div
        className="fixed top-0 left-0 right-0 h-14 bg-card/90 dark:bg-dark-card/90 backdrop-blur-md border-b border-border/50 dark:border-dark-border/50 md:hidden z-50 flex items-center px-4"
        style={{ paddingTop: 'env(safe-area-inset-top)', height: 'calc(3.5rem + env(safe-area-inset-top))' }}
      >
        <img 
          src={logo} 
          alt="Guglu's Recipes" 
          className="w-9 h-9 rounded-full object-cover border-2 border-primary/30 dark:border-dark-primary/30"
        />
      </div>

      {/* Mobile: Bottom Nav */}
      <nav
        aria-label="Primary"
        className="fixed bottom-0 left-0 right-0 bg-card dark:bg-dark-card border-t border-border dark:border-dark-border md:hidden z-50"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="flex justify-around items-center h-16 px-1">
          {navItems.map(({ path, icon: Icon, label }) => {
            const isCreate = path === '/create'
            return (
              <NavLink
                key={path}
                to={path}
                className={({ isActive }) =>
                  `flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-200 active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 dark:focus-visible:ring-dark-primary/60 ${
                    isActive
                      ? 'text-primary dark:text-dark-primary bg-primary/10 dark:bg-dark-primary/10'
                      : 'text-text-secondary dark:text-dark-text-secondary hover:text-text-primary dark:hover:text-dark-text-primary'
                  }`
                }
              >
                {isCreate ? (
                  <span className="w-8 h-8 -mt-1 rounded-full bg-primary dark:bg-dark-primary flex items-center justify-center shadow-md">
                    <Icon size={18} className="text-white dark:text-dark-background" />
                  </span>
                ) : (
                  <Icon size={20} />
                )}
                <span className="text-[9px] font-medium">{label}</span>
              </NavLink>
            )
          })}
        </div>
      </nav>

      {/* Desktop: Sidebar */}
      <nav
        aria-label="Primary"
        className="hidden md:flex fixed left-0 top-0 bottom-0 w-20 bg-card dark:bg-dark-card border-r border-border dark:border-dark-border flex-col items-center py-6 gap-2 z-50"
      >
        {/* Logo */}
        <div className="mb-6">
          <img 
            src={logo} 
            alt="Guglu's Recipes" 
            className="w-11 h-11 rounded-full object-cover border-2 border-primary/30 dark:border-dark-primary/30 shadow-md"
          />
        </div>
        
        {navItems.map(({ path, icon: Icon, label }) => {
          const isCreate = path === '/create'
          return (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 p-3 rounded-2xl transition-all duration-200 w-14 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 dark:focus-visible:ring-dark-primary/60 ${
                  isActive
                    ? 'text-primary dark:text-dark-primary bg-primary/10 dark:bg-dark-primary/10'
                    : 'text-text-secondary dark:text-dark-text-secondary hover:text-text-primary dark:hover:text-dark-text-primary hover:bg-border dark:hover:bg-dark-border'
                }`
              }
            >
              {isCreate ? (
                <span className="w-9 h-9 rounded-full bg-primary dark:bg-dark-primary flex items-center justify-center shadow-md">
                  <Icon size={20} className="text-white dark:text-dark-background" />
                </span>
              ) : (
                <Icon size={22} />
              )}
              <span className="text-[9px] font-medium">{label}</span>
            </NavLink>
          )
        })}
      </nav>
    </>
  )
}