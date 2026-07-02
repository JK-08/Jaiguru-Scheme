// Src/types/Notification/Notification.ts
//
// Shape used by Src/Services/NotificationService.js.

export interface AppNotification {
  id?: number | string;
  Status?: string;
  CreatedAt?: string;
  createdAt?: string;
  date?: string;
  title?: string;
  message?: string;
  [key: string]: unknown;
}

export interface NotificationsApiResponse {
  status: 'success' | 'error';
  data: AppNotification[];
}

export interface UnreadCountApiResponse {
  status: 'success' | 'error';
  data: {
    unreadCount?: number;
    count?: number;
  };
}
