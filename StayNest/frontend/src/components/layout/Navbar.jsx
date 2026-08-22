import { useEffect, useRef, useState } from 'react'
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { logout } from '../../features/auth/authSlice'
import {
  Menu,
  X,
  Search,
  Heart,
  LogOut,
  ShieldCheck,
  Building2,
  CalendarDays,
  User,
  ChevronDown,
} from 'lucide-react'

const navLinks = [
  { name: 'Home', to: '/' },
  { name: 'Hotels', to: '/hotels' },
  { name: 'Bookings', to: '/bookings' },
  { name: 'Saved', to: '/saved' },
]

const linkClass = ({ isActive }) =>
  `px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
    isActive
      ? 'text-primary bg-primary-bg font-semibold'
      : 'text-slate-600 hover:text-foreground hover:bg-slate-100'
  }`

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const menuRef = useRef(null)
  const userMenuRef = useRef(null)
  const { currentUser, token } = useSelector((state) => state.auth)
  const isAuthenticated = Boolean(token)
  const isAdmin = currentUser?.role === 'admin'

  useEffect(() => {
    setOpen(false)
    setUserMenuOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
      menuRef.current?.focus()
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  // Close user dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = () => {
    dispatch(logout())
    setOpen(false)
    setUserMenuOpen(false)
    navigate('/')
  }

  const avatarLetter = ((currentUser?.name || 'U').trim()[0] || 'U').toUpperCase()
    // All top-level links are visible to everyone. Auth-gated routes
  // (Bookings, Saved) and admin-only routes are protected server-side
  // via RequireAuth / RequireAdmin, so guests are redirected to /login
  // when they click them — no need to hide them here.
  const visibleLinks = navLinks

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 shadow-sm backdrop-blur-md">
      <div className="container-custom flex h-16 items-center justify-between">
        {/* Brand Logo */}
        <Link
          to="/"
          className="group flex items-center gap-2.5 text-lg font-extrabold text-foreground"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-sm transition-shadow group-hover:shadow-md">
            <Building2 size={18} />
          </span>
          <span className="tracking-tight">
            Stay<span className="text-primary">Nest</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-1 md:flex" aria-label="Main navigation">
          {visibleLinks.map((link) => (
            <NavLink key={link.to} to={link.to} className={linkClass}>
              {link.name}
            </NavLink>
          ))}
          {isAdmin && (
            <NavLink to="/admin" className={linkClass}>
              Admin
            </NavLink>
          )}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden items-center gap-2 md:flex">
          <Link
            to="/hotels"
            aria-label="Search hotels"
            className="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 hover:text-foreground"
          >
            <Search size={18} />
          </Link>

          {isAuthenticated ? (
            <>
              <Link
                to="/saved"
                aria-label="Saved hotels"
                className="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 hover:text-red-500"
              >
                <Heart size={18} />
              </Link>

              {/* User dropdown */}
              <div ref={userMenuRef} className="relative">
                <button
                  type="button"
                  onClick={() => setUserMenuOpen((v) => !v)}
                  className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:border-slate-300 hover:shadow"
                  aria-label="User menu"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-[13px] font-bold text-white">
                    {avatarLetter}
                  </span>
                  <span className="max-w-[80px] truncate">{currentUser?.name?.split(' ')[0]}</span>
                  <ChevronDown
                    size={14}
                    className={`transition-transform ${userMenuOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                {userMenuOpen && (
                  <div className="animate-fade-up absolute right-0 top-full mt-2 w-52 overflow-hidden rounded-xl border border-border bg-card shadow-xl">
                    <div className="border-b border-border bg-slate-50 px-4 py-3">
                      <p className="text-xs font-bold text-foreground">{currentUser?.name}</p>
                      <p className="truncate text-[11px] text-muted">{currentUser?.email}</p>
                    </div>
                    <div className="p-1.5">
                      <Link
                        to="/account"
                        className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100"
                      >
                        <User size={15} />
                        <span>Account Settings</span>
                      </Link>
                      <Link
                        to="/bookings"
                        className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100"
                      >
                        <CalendarDays size={15} />
                        <span>My Bookings</span>
                      </Link>
                      {isAdmin && (
                        <Link
                          to="/admin"
                          className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100"
                        >
                          <ShieldCheck size={15} />
                          <span>Admin Dashboard</span>
                        </Link>
                      )}
                    </div>
                    <div className="border-t border-border p-1.5">
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50"
                      >
                        <LogOut size={15} />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="btn-ghost h-9 rounded-xl px-4 text-sm font-semibold">
                Sign in
              </Link>
              <Link
                to="/register"
                className="btn-primary h-9 rounded-xl px-4 text-sm font-semibold shadow-sm"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Toggle */}
        <button
          type="button"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          aria-controls="mobile-menu"
          className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-700 transition-colors hover:bg-slate-100 md:hidden"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {open && (
        <div className="md:hidden">
          <div
            className="animate-fade-in fixed inset-0 top-16 z-40 bg-black/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
            ref={menuRef}
            tabIndex={-1}
            className="animate-drawer-down fixed inset-x-3 top-[4.5rem] z-50 overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
          >
            {isAuthenticated && (
              <div className="flex items-center gap-3 border-b border-border bg-slate-50 px-4 py-3.5">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-sm font-bold text-white">
                  {avatarLetter}
                </span>
                <div>
                  <p className="text-sm font-bold text-foreground">{currentUser?.name}</p>
                  <p className="text-xs text-muted">{currentUser?.email}</p>
                </div>
              </div>
            )}
            <nav className="flex flex-col gap-1 p-3" aria-label="Mobile navigation">
              {visibleLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={() => setOpen(false)}
                  className={linkClass}
                >
                  {link.name}
                </NavLink>
              ))}
              {isAdmin && (
                <NavLink to="/admin" onClick={() => setOpen(false)} className={linkClass}>
                  Admin Dashboard
                </NavLink>
              )}
            </nav>

            <div className="border-t border-border p-3">
              {isAuthenticated ? (
                <>
                  <Link
                    to="/account"
                    onClick={() => setOpen(false)}
                    className="btn-secondary mb-2 h-10 w-full justify-center rounded-xl text-xs font-bold"
                  >
                    <User size={15} className="mr-2" />
                    Account Settings
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="h-10 w-full rounded-xl bg-red-50 text-xs font-bold text-red-600 transition-colors hover:bg-red-100"
                  >
                    <LogOut size={15} className="mr-2 inline" />
                    Sign Out
                  </button>
                </>
              ) : (
                <div className="flex flex-col gap-2">
                  <Link
                    to="/login"
                    onClick={() => setOpen(false)}
                    className="btn-secondary h-10 w-full justify-center rounded-xl text-xs font-bold"
                  >
                    Sign in
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setOpen(false)}
                    className="btn-primary h-10 w-full justify-center rounded-xl text-xs font-bold shadow-sm"
                  >
                    Create Account
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
