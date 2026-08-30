import { api } from './api';
import type { AppNotification, NotificationPagination } from '../types';

/** GET /api/notifications?unread=&page=&limit= — the user's notifications. */
export async function fetchNotifications(params?: {
  unread?: boolean;
  page?: number;
  limit?: number;
}): Promise<{ notifications: AppNotification[]; unreadCount: number; pagination: NotificationPagination }> {
  const qs = new URLSearchParams();
  if (params?.unread) qs.set('unread', 'true');
  if (params?.page) qs.set('page', String(params.page));
  if (params?.limit) qs.set('limit', String(params.limit));
  const { data } = await api.get<{
    success: boolean;
    notifications: AppNotification[];
    unreadCount: number;
    pagination: NotificationPagination;
  }>(`/notifications?${qs.toString()}`);
  return {
    notifications: data.notifications,
    unreadCount: data.unreadCount,
    pagination: data.pagination,
  };
}

/** PATCH /api/notifications/read — mark one (id) or all notifications as read. */
export async function markNotificationRead(id?: string, all = false): Promise<void> {
  await api.patch('/notifications/read', { id: id ?? undefined, all });
}