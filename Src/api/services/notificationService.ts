// Src/api/services/notificationService.ts
//
// Ported from Src/Services/NotificationService.js (was a class with an
// internal getUserId()/getAuthToken() lookup per call). Here userId is
// passed in explicitly by the caller (the hook), consistent with the rest
// of the new api/ layer, and auth is handled by axiosInstance.
import { callApi } from '../apiClient';
import { NOTIFICATIONS } from '../endpoints';
import {
  AppNotification,
  NotificationsApiResponse,
  UnreadCountApiResponse,
} from '../../types/Notification/Notification';

export const notificationService = {
  getUserNotifications: async (userId: string | number): Promise<AppNotification[]> => {
    const res = await callApi<null, NotificationsApiResponse>({
      method: 'get',
      url: NOTIFICATIONS.GET_USER(userId),
    });
    return res?.status === 'success' && Array.isArray(res.data) ? res.data : [];
  },

  getUnreadCount: async (userId: string | number): Promise<number> => {
    const res = await callApi<null, UnreadCountApiResponse>({
      method: 'get',
      url: NOTIFICATIONS.UNREAD_COUNT(userId),
    });
    return res?.data?.unreadCount ?? res?.data?.count ?? 0;
  },

  markAllAsRead: (userId: string | number) =>
    callApi<null, unknown>({ method: 'post', url: NOTIFICATIONS.MARK_ALL_READ(userId) }),

  markAsRead: (notificationId: string | number, userId: string | number) =>
    callApi<null, unknown>({ method: 'post', url: NOTIFICATIONS.MARK_READ(notificationId, userId) }),

  deleteNotification: (notificationId: string | number) =>
    callApi<null, unknown>({ method: 'delete', url: NOTIFICATIONS.DELETE_ONE(notificationId) }),

  deleteAllNotifications: (userId: string | number) =>
    callApi<null, unknown>({ method: 'delete', url: NOTIFICATIONS.DELETE_BY_USER(userId) }),

  /** Same relative-time formatting the old class exposed. */
  formatNotificationDate: (dateString?: string): string => {
    if (!dateString) return 'Unknown date';
    const date = new Date(dateString);
    const diffMs = Date.now() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  },
};
