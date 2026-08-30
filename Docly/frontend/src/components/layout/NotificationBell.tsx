import { useEffect, useRef, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Bell, CheckCheck, Inbox } from 'lucide-react';
import { fetchNotifications, markNotificationRead } from '../../services/notificationService';
import { apiErrorMessage } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import type { AppNotification } from '../../types';

/**
 * Notification bell with a dropdown listing the user's recent in-app
 * notifications and an unread count badge.
 */
export default function NotificationBell() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const result = await fetchNotifications({ limit: 10 });
      setNotifications(result.notifications);
      setUnreadCount(result.unreadCount);
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  // Close when clicking outside.
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const handleMarkRead = async (n: AppNotification) => {
    try {
      await markNotificationRead(n.id);
      setNotifications((list) => list.map((x) => (x.id === n.id ? { ...x, read: true } : x)));
      setUnreadCount((c) => Math.max(0, c - (n.read ? 0 : 1)));
    } catch {
      /* ignore — cosmetic */
    }
  };

  const handleMarkAll = async () => {
    try {
      await markNotificationRead(undefined, true);
      setNotifications((list) => list.map((x) => ({ ...x, read: true })));
      setUnreadCount(0);
    } catch {
      /* ignore */
    }
  };

  if (!user) return null;

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Notifications"
        className="btn-secondary relative p-2"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-xl border border-border bg-card shadow-lg">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <span className="font-medium text-foreground">Notifications</span>
            {unreadCount > 0 && (
              <button onClick={handleMarkAll} className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
                <CheckCheck className="h-3.5 w-3.5" />
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loading && <p className="px-4 py-6 text-center text-sm text-muted">Loading…</p>}
            {!loading && error && <p className="px-4 py-6 text-center text-sm text-red-600">{error}</p>}
            {!loading && !error && notifications.length === 0 && (
              <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
                <Inbox className="h-8 w-8 text-muted" />
                <p className="text-sm text-muted">No notifications yet</p>
              </div>
            )}
            {!loading &&
              !error &&
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleMarkRead(n)}
                  className={`flex w-full cursor-pointer flex-col gap-1 border-b border-border px-4 py-3 text-left hover:bg-background-alt ${n.read ? 'opacity-60' : ''}`}
                >
                  <span className="text-sm font-medium text-foreground">{n.title}</span>
                  <span className="text-xs text-muted">{n.message}</span>
                  <span className="text-[11px] text-primary">
                    <Link to={n.link || '/appointments'} onClick={() => setOpen(false)}>
                      View
                    </Link>
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}