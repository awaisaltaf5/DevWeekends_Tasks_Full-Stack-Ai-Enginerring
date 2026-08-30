import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  Menu,
  X,
  CalendarCheck,
  UserRound,
  LogOut,
  LayoutDashboard,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import NotificationBell from './NotificationBell';
import logo from '../../assets/logo.svg';
import logoMark from '../../assets/logo-mark.svg';

const baseItems = [
  { label: 'Home', to: '/' },
  { label: 'Doctors', to: '/doctors' },
];

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
    isActive
      ? 'text-primary bg-primary-bg'
      : 'text-muted hover:text-foreground hover:bg-background-alt'
  }`;

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navItems = user && (user.role === 'patient' || user.role === 'doctor')
    ? [...baseItems, { label: 'Appointments', to: '/appointments' }]
    : [...baseItems];

  if (user?.role === 'patient' || user?.role === 'admin') {
    if (!navItems.some((i) => i.to === '/records')) {
      navItems.push({ label: 'Records', to: '/records' });
    }
  }

  const handleLogout = () => {
    logout();
    setOpen(false);
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-md">
      <div className="container-docly flex h-16 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center transition-opacity hover:opacity-80" aria-label="Docly home">
          <img src={logo} alt="Docly" className="hidden h-10 w-auto sm:block" />
          <img src={logoMark} alt="Docly" className="h-10 w-10 sm:hidden" />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={linkClass}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Right side actions */}
        <div className="hidden items-center gap-2 md:flex">
          {user ? (
            <>
              {(user.role === 'admin' || user.role === 'doctor') && <NotificationBell />}
              <div className="flex items-center gap-2 border-l border-border pl-2">
                <div className="flex flex-col items-end">
                  <span className="text-xs font-medium text-foreground">
                    {user.name.split(' ')[0]}
                  </span>
                  <span className="text-xs text-muted capitalize">{user.role}</span>
                </div>
              </div>
              {user.role === 'admin' && (
                <Link to="/admin" className="btn-secondary px-3 py-2 text-sm">
                  <ShieldCheck className="h-4 w-4" />
                </Link>
              )}
              {user.role === 'doctor' && (
                <Link to="/doctor" className="btn-secondary px-3 py-2 text-sm">
                  <LayoutDashboard className="h-4 w-4" />
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="btn-secondary px-3 py-2 text-sm"
                aria-label="Logout"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-secondary px-4 py-2 text-sm">
                <UserRound className="h-4 w-4" />
                Sign in
              </Link>
              <Link to="/register" className="btn-primary px-4 py-2 text-sm">
                <CalendarCheck className="h-4 w-4" />
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          aria-label="Toggle menu"
          onClick={() => setOpen((v) => !v)}
          className="btn-secondary p-2 md:hidden"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="animate-fade-up border-t border-border bg-card md:hidden">
          <div className="container-docly flex flex-col gap-1 py-3">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={linkClass}
                onClick={() => setOpen(false)}
              >
                {item.label}
              </NavLink>
            ))}
            <div className="mt-3 flex flex-col gap-2 border-t border-border pt-3">
              {user ? (
                <>
                  <div className="px-3 py-2">
                    <p className="text-sm font-medium text-foreground">{user.name}</p>
                    <p className="text-xs text-muted capitalize">{user.role}</p>
                  </div>
                  {user.role === 'admin' && (
                    <Link
                      to="/admin"
                      className="btn-secondary justify-start px-4 py-2 text-sm"
                      onClick={() => setOpen(false)}
                    >
                      <ShieldCheck className="h-4 w-4" />
                      Admin Dashboard
                    </Link>
                  )}
                  {user.role === 'doctor' && (
                    <Link
                      to="/doctor"
                      className="btn-secondary justify-start px-4 py-2 text-sm"
                      onClick={() => setOpen(false)}
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      Doctor Dashboard
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      handleLogout();
                      setOpen(false);
                    }}
                    className="btn-secondary justify-start px-4 py-2 text-sm"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="btn-secondary justify-center px-4 py-2 text-sm"
                    onClick={() => setOpen(false)}
                  >
                    <UserRound className="h-4 w-4" />
                    Sign in
                  </Link>
                  <Link
                    to="/register"
                    className="btn-primary justify-center px-4 py-2 text-sm"
                    onClick={() => setOpen(false)}
                  >
                    <CalendarCheck className="h-4 w-4" />
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}