const BASE_URL = "https://yourdomain.com/api/v1/notifications"; // change this

// Common response handler
const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Something went wrong");
  }
  return data;
};

// Get user notifications
export const getUserNotifications = async (userId) => {
  const res = await fetch(`${BASE_URL}/user/${userId}`);
  return handleResponse(res);
};

// Get unread count
export const getUnreadCount = async (userId) => {
  const res = await fetch(`${BASE_URL}/user/${userId}/unread-count`);
  return handleResponse(res);
};

// Mark single notification as read
export const markAsRead = async (notificationId, userId) => {
  const res = await fetch(
    `${BASE_URL}/read/${notificationId}/user/${userId}`,
    { method: "POST" }
  );
  return handleResponse(res);
};

// Mark all as read
export const markAllAsRead = async (userId) => {
  const res = await fetch(`${BASE_URL}/read/all/${userId}`, {
    method: "POST",
  });
  return handleResponse(res);
};