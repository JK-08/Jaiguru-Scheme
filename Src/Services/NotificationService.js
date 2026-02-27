import { API_BASE_URL } from "../Config/BaseUrl";
import { getUserId, getAuthToken } from "../Utills/AsynchStorageHelper";

class NotificationService {
  // Common request handler
  async request(endpoint, options = {}) {
    try {
      const token = await getAuthToken();

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
          ...options.headers,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `HTTP ${response.status} - ${errorText || "Something went wrong"}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error("API Request Error:", error);
      throw error;
    }
  }

  // ✅ Get all notifications
  async getUserNotifications() {
    try {
      const userId = await getUserId();
      if (!userId) throw new Error("User ID not found");

      const response = await this.request(`/notifications/user/${userId}`);
      
      console.log("API Response:", response); // Debug log

      // Handle the response structure from your API
      if (response?.status === "success" && Array.isArray(response.data)) {
        return {
          code: 200,
          data: response.data,
          message: "Notifications fetched successfully",
        };
      } else {
        return {
          code: 200,
          data: [],
          message: "No notifications found",
        };
      }
    } catch (error) {
      console.log("Error fetching notifications:", error);
      return {
        code: 500,
        data: [],
        message: error.message,
      };
    }
  }

  // ✅ Get unread count
  async getUnreadCount() {
    try {
      const userId = await getUserId();
      if (!userId) throw new Error("User ID not found");

      const response = await this.request(
        `/notifications/user/${userId}/unread-count`
      );

      // Extract unread count from response
      let unreadCount = 0;
      if (response?.status === "success" && response.data) {
        unreadCount = response.data.unreadCount || response.data.count || 0;
      }

      return {
        code: 200,
        data: { unreadCount },
        message: "Unread count fetched successfully",
      };
    } catch (error) {
      return {
        code: 500,
        data: { unreadCount: 0 },
        message: error.message,
      };
    }
  }

  // ✅ Mark all as read
  async markAllAsRead() {
    try {
      const userId = await getUserId();
      if (!userId) throw new Error("User ID not found");

      const response = await this.request(
        `/notifications/read/all/${userId}`,
        { method: "POST" }
      );

      return {
        code: 200,
        data: response,
        message: "All notifications marked as read",
      };
    } catch (error) {
      return {
        code: 500,
        data: {},
        message: error.message,
      };
    }
  }

  // ✅ Mark single notification as read
  async markAsRead(notificationId) {
    try {
      const userId = await getUserId();
      if (!userId) throw new Error("User ID not found");

      const response = await this.request(
        `/notifications/read/${notificationId}/user/${userId}`,
        { method: "POST" }
      );

      return {
        code: 200,
        data: response,
        message: "Notification marked as read",
      };
    } catch (error) {
      return {
        code: 500,
        data: {},
        message: error.message,
      };
    }
  }

  // ✅ Delete single notification
  async deleteNotification(notificationId) {
    try {
      const response = await this.request(
        `/notifications/notification/${notificationId}`,
        { method: "DELETE" }
      );

      return {
        code: 200,
        data: response,
        message: "Notification deleted successfully",
      };
    } catch (error) {
      return {
        code: 500,
        data: {},
        message: error.message,
      };
    }
  }

  // ✅ Delete all notifications
  async deleteAllNotifications() {
    try {
      const userId = await getUserId();
      if (!userId) throw new Error("User ID not found");

      const response = await this.request(
        `/notifications/user/${userId}`,
        { method: "DELETE" }
      );

      return {
        code: 200,
        data: response,
        message: "All notifications deleted successfully",
      };
    } catch (error) {
      return {
        code: 500,
        data: {},
        message: error.message,
      };
    }
  }

  // ✅ Format date helper
  formatNotificationDate(dateString) {
    if (!dateString) return "Unknown date";

    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;

    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMinutes < 1) return "Just now";
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString();
  }

  // ✅ Filter notifications
  filterNotificationsByStatus(notifications, status) {
    return notifications.filter((n) => n.Status === status);
  }

  // ✅ Sort notifications
  sortNotificationsByDate(notifications, ascending = false) {
    return notifications.sort((a, b) => {
      const dateA = new Date(a.CreatedAt || a.createdAt || a.date);
      const dateB = new Date(b.CreatedAt || b.createdAt || b.date);
      return ascending ? dateA - dateB : dateB - dateA;
    });
  }

  // ✅ Get stats
  async getNotificationStats() {
    try {
      const [notificationsRes, unreadRes] = await Promise.all([
        this.getUserNotifications(),
        this.getUnreadCount(),
      ]);

      const total = notificationsRes.data.length;
      const unread = unreadRes.data.unreadCount;

      return {
        code: 200,
        data: {
          total,
          unread,
          read: total - unread,
        },
        message: "Notification stats fetched successfully",
      };
    } catch (error) {
      return {
        code: 500,
        data: { total: 0, unread: 0, read: 0 },
        message: error.message,
      };
    }
  }
}

export default new NotificationService();