// Src/api/hooks/Notifications/useNotifications.ts
//
// Ported from Src/Hooks/useNotifications.js. The old version resolved
// userId internally on every single call (via a class method reading
// AsyncStorage each time); here it's resolved once and passed to the
// service explicitly, matching the rest of the new api/ layer.
import { useState, useEffect, useCallback } from 'react';
import { notificationService } from '../../services/notificationService';
import { getUserId } from '../../../Utills/AsynchStorageHelper';

export interface FormattedNotification {
  id: number | string;
  title?: string;
  message?: string;
  imageUrl?: unknown;
  status?: string;
  createdAt?: string;
  isRead: boolean;
  url?: unknown;
  userId?: unknown;
  sentAt?: unknown;
  scheduledTime?: unknown;
}

const formatNotification = (item: any): FormattedNotification => ({
  id: item.Id,
  title: item.Title,
  message: item.Message,
  imageUrl: item.ImageUrl,
  status: item.Status,
  createdAt: item.CreatedAt,
  isRead: item.IsRead || false,
  url: item.Url,
  userId: item.UserId,
  sentAt: item.SentAt,
  scheduledTime: item.ScheduledTime,
});

const useNotifications = () => {
  const [notifications, setNotifications] = useState<FormattedNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const userId = await getUserId();
      if (!userId) {
        setNotifications([]);
        setUnreadCount(0);
        return;
      }

      const data = await notificationService.getUserNotifications(userId);
      const formatted = data.map(formatNotification);
      setNotifications(formatted);
      setUnreadCount(formatted.filter((n) => !n.isRead).length);
    } catch (err: any) {
      setError(err?.message);
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const userId = await getUserId();
      if (!userId) return;
      const count = await notificationService.getUnreadCount(userId);
      setUnreadCount(count);
    } catch (err) {
      console.error('Error fetching unread count:', err);
    }
  }, []);

  const markAsRead = async (notificationId: number | string) => {
    try {
      const userId = await getUserId();
      if (!userId) return;
      await notificationService.markAsRead(notificationId, userId);

      setNotifications((prev) => prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n)));
      setUnreadCount((prev) => Math.max(prev - 1, 0));
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      const userId = await getUserId();
      if (!userId) return;
      await notificationService.markAllAsRead(userId);

      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  const deleteNotification = async (notificationId: number | string) => {
    try {
      const deletedItem = notifications.find((n) => n.id === notificationId);
      await notificationService.deleteNotification(notificationId);

      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
      if (deletedItem && !deletedItem.isRead) {
        setUnreadCount((prev) => Math.max(prev - 1, 0));
      }
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  };

  const deleteAllNotifications = async () => {
    try {
      const userId = await getUserId();
      if (!userId) return;
      await notificationService.deleteAllNotifications(userId);

      setNotifications([]);
      setUnreadCount(0);
    } catch (err) {
      console.error('Error deleting all notifications:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    refresh: fetchNotifications,
    refreshUnreadCount: fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
  };
};

export default useNotifications;
