import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LogOut, LayoutDashboard, Stethoscope, Menu, X, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import BrandLogo from './BrandLogo';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { logout, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');

  const NavLink: React.FC<{ to: string; icon: React.ReactNode; label: string }> = ({ to, icon, label }) => (
    <Link
      to={to}
      onClick={() => setSidebarOpen(false)}
      className={`flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
        isActive(to)
          ? 'bg-primary-bg text-primary'
          : 'text-muted hover:bg-background-alt hover:text-foreground'
      }`}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );

  return (
    <div className="flex min-h-screen bg-background-alt">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-border bg-card transition-transform duration-300 md:static md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
        aria-label="Admin navigation"
      >
        <div className="flex h-16 items-center gap-3 border-b border-border px-6">
          <Link to="/dashboard" onClick={() => setSidebarOpen(false)}>
            <BrandLogo className="h-9" />
          </Link>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="ml-auto text-muted hover:text-foreground md:hidden"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          <p className="px-4 pb-2 text-xs font-semibold uppercase tracking-wide text-muted">
            Operations
          </p>
          <NavLink to="/dashboard" icon={<LayoutDashboard className="h-4 w-4" />} label="Dashboard" />
          <NavLink to="/doctors" icon={<Stethoscope className="h-4 w-4" />} label="Doctor Management" />
        </nav>

        <div className="border-t border-border p-4">
          {user && (
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground">{user.name}</p>
                <p className="flex items-center gap-1 text-xs text-muted">
                  <ShieldCheck className="h-3.5 w-3.5" /> Administrator
                </p>
              </div>
            </div>
          )}
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-background-alt"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile top bar */}
        <header className="sticky top-0 z-40 flex h-16 items-center gap-3 border-b border-border bg-card/95 px-4 backdrop-blur-md md:hidden">
          <BrandLogo className="h-8" />
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="ml-auto rounded-lg border border-border p-2 text-foreground"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        </header>

        <main className="flex-1 overflow-x-hidden">{children}</main>
      </div>

      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-slate-900/40 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}
    </div>
  );
};

export default Layout;