import { useState, useEffect, useCallback } from "react";
import NotificationService from "../Services/NotificationService";

const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await NotificationService.getUserNotifications();

      if (response?.code === 200 && Array.isArray(response.data)) {
        // Map the API response to a consistent format
        const formatted = response.data.map((item) => ({
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
        }));

        setNotifications(formatted);

        // Calculate unread count from data
        const unread = formatted.filter((n) => !n.isRead).length;
        setUnreadCount(unread);
      } else {
        setNotifications([]);
        setUnreadCount(0);
      }
    } catch (err) {
      setError(err.message);
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await NotificationService.getUnreadCount();
      if (response?.code === 200) {
        setUnreadCount(response.data.unreadCount);
      }
    } catch (err) {
      console.error("Error fetching unread count:", err);
    }
  }, []);

  const markAsRead = async (notificationId) => {
    try {
      const response = await NotificationService.markAsRead(notificationId);
      
      if (response?.code === 200) {
        // Optimistic update
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notificationId ? { ...n, isRead: true } : n
          )
        );

        // Update unread count
        setUnreadCount((prev) => Math.max(prev - 1, 0));
      }
    } catch (err) {
      console.error("Error marking as read:", err);
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await NotificationService.markAllAsRead();
      
      if (response?.code === 200) {
        setNotifications((prev) =>
          prev.map((n) => ({ ...n, isRead: true }))
        );
        setUnreadCount(0);
      }
    } catch (err) {
      console.error("Error marking all as read:", err);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      const response = await NotificationService.deleteNotification(notificationId);
      
      if (response?.code === 200) {
        // Check if the deleted notification was unread
        const deletedItem = notifications.find((n) => n.id === notificationId);
        
        setNotifications((prev) =>
          prev.filter((n) => n.id !== notificationId)
        );

        if (deletedItem && !deletedItem.isRead) {
          setUnreadCount((prev) => Math.max(prev - 1, 0));
        }
      }
    } catch (err) {
      console.error("Error deleting notification:", err);
    }
  };

  const deleteAllNotifications = async () => {
    try {
      const response = await NotificationService.deleteAllNotifications();
      
      if (response?.code === 200) {
        setNotifications([]);
        setUnreadCount(0);
      }
    } catch (err) {
      console.error("Error deleting all notifications:", err);
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